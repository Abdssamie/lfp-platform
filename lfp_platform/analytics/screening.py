"""Screening algorithms for micro-short defect detection and DCIR computation.

1. K-Value (Self-Discharge Rate dV/dt):
   Linear regression over OCV rest periods to isolate micro-short risks.
2. DCIR (Direct Current Internal Resistance):
   Ohmic voltage drop Delta V / Delta I during high-rate current pulse steps.
"""

import numpy as np
import polars as pl
from scipy.stats import linregress
from typing import Optional, Tuple
from lfp_platform.models import ScreeningResult


def compute_k_value(
    df_rest: pl.DataFrame,
    settling_time_s: float = 400.0,
    micro_short_threshold_mv_day: float = 0.50,
) -> Tuple[float, float, bool]:
    """Compute K-value (dV/dt) from rest step time-series.
    
    Args:
        df_rest: Polars DataFrame of the REST step (current = 0).
        settling_time_s: Initial period to discard to let overpotential relax.
        micro_short_threshold_mv_day: Defect threshold in mV/day.
        
    Returns:
        k_value_mv_day: Rate of voltage drop in mV/day.
        r_squared: Coefficient of determination of the linear fit.
        is_micro_short: True if K-value exceeds defect threshold.
    """
    if df_rest.is_empty():
        return 0.0, 0.0, False

    t_arr = df_rest["timestamp_s"].to_numpy()
    v_arr = df_rest["voltage_v"].to_numpy()

    # Discard initial exponential relaxation phase
    t_relative = t_arr - t_arr[0]
    mask = t_relative >= settling_time_s

    if np.sum(mask) < 5:
        # If rest period is short, use the second half of the points
        half = len(t_arr) // 2
        mask = np.zeros(len(t_arr), dtype=bool)
        mask[half:] = True

    t_fit = t_relative[mask]
    v_fit = v_arr[mask]

    if len(t_fit) < 3:
        return 0.0, 0.0, False

    # Linear regression: V(t) = slope * t + intercept
    res = linregress(t_fit, v_fit)
    
    # Negative slope means self-discharge (drop in voltage)
    # K-value is conventionally defined as positive rate of drop: -dV/dt
    # res.slope is in Volts / second
    slope_v_s = -float(res.slope)
    k_value_mv_day = slope_v_s * 1000.0 * (24.0 * 3600.0)
    r_squared = float(res.rvalue ** 2) if res.rvalue is not None else 0.0

    # Ensure non-negative K-value
    k_value_mv_day = max(0.0, k_value_mv_day)
    is_micro_short = bool(k_value_mv_day >= micro_short_threshold_mv_day)

    return round(k_value_mv_day, 4), round(r_squared, 4), is_micro_short


def compute_dcir(
    df_cell: pl.DataFrame,
    pre_pulse_window_s: float = 5.0,
) -> Tuple[float, float]:
    """Compute DCIR (Direct Current Internal Resistance) from pulse step.
    
    Args:
        df_cell: Full cell time-series containing REST and PULSE steps.
        pre_pulse_window_s: Window before pulse to calculate baseline OCV.
        
    Returns:
        dcir_mohm: Internal resistance in milli-Ohms (mOhm).
        pulse_current_a: Applied pulse current in Amps.
    """
    pulse_rows = df_cell.filter(pl.col("step_type").str.contains("PULSE"))
    if pulse_rows.is_empty():
        # Fallback: find any step with high current magnitude
        pulse_rows = df_cell.filter(pl.col("current_a").abs() >= 2.0)
        if pulse_rows.is_empty():
            return 0.0, 0.0

    # First point of pulse
    pulse_start_time = pulse_rows["timestamp_s"][0]
    i_pulse = float(pulse_rows["current_a"][0])
    v_pulse = float(pulse_rows["voltage_v"][0])

    # Pre-pulse baseline voltage (immediately before pulse start)
    pre_pulse = df_cell.filter(
        (pl.col("timestamp_s") < pulse_start_time)
        & (pl.col("timestamp_s") >= pulse_start_time - pre_pulse_window_s)
    )

    if pre_pulse.is_empty():
        return 0.0, 0.0

    v_baseline = float(pre_pulse["voltage_v"][-1])
    i_baseline = float(pre_pulse["current_a"][-1])

    delta_v = abs(v_baseline - v_pulse)
    delta_i = abs(i_pulse - i_baseline)

    if delta_i < 1e-3:
        return 0.0, 0.0

    # R = Delta V / Delta I (Ohms) -> multiply by 1000 for mOhm
    dcir_mohm = (delta_v / delta_i) * 1000.0

    return round(dcir_mohm, 2), round(abs(i_pulse), 2)


def screen_cell(df_cell: pl.DataFrame) -> ScreeningResult:
    """Run full defect screening (K-value and DCIR) for a cell."""
    # 1. K-value
    df_rest = df_cell.filter(pl.col("step_type") == "REST")
    k_val, r2, is_micro = compute_k_value(df_rest)

    # 2. DCIR
    dcir_mohm, pulse_amp = compute_dcir(df_cell)

    return ScreeningResult(
        k_value_mv_day=k_val,
        k_value_r_squared=r2,
        is_micro_short=is_micro,
        dcir_mohm=dcir_mohm,
        dcir_pulse_current_a=pulse_amp,
    )
