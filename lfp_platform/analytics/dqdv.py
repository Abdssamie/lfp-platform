"""Differential Capacity Analysis (dQ/dV) engine with Savitzky-Golay smoothing.

Tracks electrochemical phase transitions in LFP cells:
- FePO4 <-> LiFePO4 two-phase plateau differentiation
- Peak position shifts (polarization / internal resistance evolution)
- Peak area loss (Loss of Lithium Inventory - LLI)
"""

import numpy as np
import polars as pl
from scipy.interpolate import PchipInterpolator
from scipy.signal import find_peaks, savgol_filter
from typing import Dict, List, Optional, Tuple
from lfp_platform.models import DQDVPeak


def compute_dqdv(
    df_step: pl.DataFrame,
    v_min: float = 2.90,
    v_max: float = 3.55,
    grid_points: int = 400,
    savgol_window: int = 21,
    savgol_polyorder: int = 3,
) -> Tuple[np.ndarray, np.ndarray, List[DQDVPeak]]:
    """Compute smoothed dQ/dV curve and detect phase transition peaks.
    
    Args:
        df_step: Polars DataFrame containing 'voltage_v' and 'capacity_ah' for a single CC step.
        v_min: Lower voltage cutoff for analysis.
        v_max: Upper voltage cutoff for analysis.
        grid_points: Number of uniform voltage intervals (e.g. ~1.5 mV resolution).
        savgol_window: Window length for Savitzky-Golay polynomial filter (must be odd).
        savgol_polyorder: Polynomial order for Savitzky-Golay filter.
        
    Returns:
        v_grid: Resampled uniform voltage vector.
        dqdv_smooth: Smoothed differential capacity dQ/dV array (Ah/V).
        peaks: List of identified DQDVPeak objects.
    """
    # Extract arrays
    v_raw = df_step["voltage_v"].to_numpy()
    q_raw = df_step["capacity_ah"].to_numpy()

    # Filter to monotonic range
    mask = (v_raw >= v_min) & (v_raw <= v_max)
    v_filt = v_raw[mask]
    q_filt = q_raw[mask]

    if len(v_filt) < 30:
        # Fallback if insufficient points
        return np.array([]), np.array([]), []

    # Ensure strictly strictly monotonic voltage for spline interpolation
    sort_idx = np.argsort(v_filt)
    v_sorted = v_filt[sort_idx]
    q_sorted = q_filt[sort_idx]

    # Remove duplicate voltages
    unique_v, unique_indices = np.unique(v_sorted, return_index=True)
    unique_q = q_sorted[unique_indices]

    if len(unique_v) < 10:
        return np.array([]), np.array([]), []

    # Uniform voltage grid
    v_grid = np.linspace(unique_v[0], unique_v[-1], grid_points)

    # Shape-preserving monotonic PCHIP interpolation
    interpolator = PchipInterpolator(unique_v, unique_q)
    q_interp = interpolator(v_grid)

    # First numerical derivative dQ / dV
    dv = v_grid[1] - v_grid[0]
    dqdv_raw = np.gradient(q_interp, dv)

    # Savitzky-Golay filtering to suppress quantization noise
    window = min(savgol_window, len(dqdv_raw) - 1)
    if window % 2 == 0:
        window -= 1
    if window <= savgol_polyorder:
        window = savgol_polyorder + 2 if (savgol_polyorder + 2) % 2 != 0 else savgol_polyorder + 3

    dqdv_smooth = savgol_filter(dqdv_raw, window_length=window, polyorder=savgol_polyorder)
    # Physical constraint: dQ/dV during charge is non-negative
    dqdv_smooth = np.clip(dqdv_smooth, 0.0, None)

    # Peak detection using scipy.signal
    peak_indices, properties = find_peaks(
        dqdv_smooth,
        height=0.2 * np.max(dqdv_smooth) if len(dqdv_smooth) > 0 else 0.1,
        prominence=0.1,
        distance=grid_points // 20,
    )

    detected_peaks: List[DQDVPeak] = []
    for idx in peak_indices:
        v_peak = float(v_grid[idx])
        height = float(dqdv_smooth[idx])
        prom = float(properties["prominences"][np.where(peak_indices == idx)[0][0]])
        
        # Approximate peak area via trapezoid in the 30mV neighborhood
        nb_mask = np.abs(v_grid - v_peak) <= 0.03
        trapz_fn = getattr(np, "trapezoid", getattr(np, "trapz", None))
        area = float(trapz_fn(dqdv_smooth[nb_mask], v_grid[nb_mask])) if np.sum(nb_mask) > 1 and trapz_fn is not None else 0.0

        detected_peaks.append(DQDVPeak(
            peak_voltage_v=round(v_peak, 4),
            peak_height=round(height, 4),
            prominence=round(prom, 4),
            area=round(area, 4),
            phase_transition="FePO4 <-> LiFePO4",
        ))

    # Sort peaks by prominence descending
    detected_peaks.sort(key=lambda p: p.prominence, reverse=True)

    return v_grid, dqdv_smooth, detected_peaks
