"""Fast, vectorized physics-grounded synthetic cycler time-series generator for LFP cells.

Simulates commercial LFP formation & aging profiles adhering to the 4-step regime:
1. CC Charge (1.0A to 3.65V ceiling)
2. CV Saturation (3.65V clamp, exponential current decay down to 0.05A cutoff)
3. Rest Phase (I = 0, OCV relaxation + self-discharge slope)
4. DCIR Current Pulse (10A pulse for 2s)
5. CC Discharge (1.0A to 2.5V cutoff)
"""

import numpy as np
import polars as pl
from typing import Dict, List, Optional


def _lfp_ocv(soc: np.ndarray) -> np.ndarray:
    """Semi-empirical Open Circuit Voltage curve for LFP (LiFePO4) vs graphite.
    
    Exhibits characteristic flat two-phase transition plateau at ~3.38V - 3.42V
    between 10% and 90% SOC.
    """
    soc = np.clip(soc, 1e-4, 0.9999)
    # Baseline plateau with two-phase transition features
    v_base = (
        3.22
        + 0.16 * (1 / (1 + np.exp(-35 * (soc - 0.15))))
        + 0.05 * (1 / (1 + np.exp(-40 * (soc - 0.70))))
    )
    # Low SOC dropoff and High SOC steep rise
    v_low = -0.55 * np.exp(-30 * soc)
    v_high = 0.28 / (1.01 - soc) ** 0.35 - 0.28
    return v_base + v_low + v_high


def generate_cell_run(
    cell_id: str,
    channel_id: int,
    cycle_index: int = 1,
    nominal_capacity_ah: float = 3.20,
    has_micro_short: bool = False,
    has_high_dcir: bool = False,
    has_low_capacity: bool = False,
    random_seed: Optional[int] = None,
) -> pl.DataFrame:
    """Generate vectorized cycler time-series for a single cell."""
    rng = np.random.default_rng(random_seed)

    # Base parameters with slight normal variation
    capacity_multiplier = 0.88 if has_low_capacity else float(rng.normal(1.0, 0.012))
    actual_capacity_ah = nominal_capacity_ah * capacity_multiplier
    
    # Internal resistance in Ohms
    base_r_int = 0.052 if has_high_dcir else float(rng.normal(0.022, 0.0015))
    
    # Self-discharge K-value in mV/day
    k_value_mv_day = float(rng.uniform(1.8, 4.5)) if has_micro_short else float(rng.normal(0.08, 0.02))
    k_slope_v_s = (k_value_mv_day / 1000.0) / (24 * 3600)

    # -------------------------------------------------------------
    # Step 1: CC Charge (1.0A up to 88% SOC / 3.65V)
    # -------------------------------------------------------------
    n_cc = 200
    soc_cc = np.linspace(0.02, 0.88, n_cc)
    q_cc = soc_cc * actual_capacity_ah
    t_cc = (q_cc / 1.0) * 3600.0  # seconds at 1.0A
    ocv_cc = _lfp_ocv(soc_cc)
    v_cc = np.clip(ocv_cc + 1.0 * base_r_int + rng.normal(0, 0.0003, n_cc), 2.50, 3.65)
    i_cc = np.full(n_cc, 1.0)
    step_cc = ["CC_CHG"] * n_cc
    temp_cc = 25.0 + 1.0 * 0.4 + rng.normal(0, 0.05, n_cc)

    # -------------------------------------------------------------
    # Step 2: CV Saturation (Clamp 3.65V, current decays 1.0A -> 0.05A)
    # -------------------------------------------------------------
    n_cv = 60
    t_cv_rel = np.linspace(0, 1800, n_cv)
    t_cv = t_cc[-1] + t_cv_rel
    i_cv = 0.05 + 0.95 * np.exp(-t_cv_rel / 400.0)
    # Cumulative CV capacity
    dt_cv = t_cv_rel[1] - t_cv_rel[0]
    q_cv = q_cc[-1] + np.cumsum(i_cv * dt_cv) / 3600.0
    v_cv = 3.65 + rng.normal(0, 0.0002, n_cv)
    step_cv = ["CV_CHG"] * n_cv
    temp_cv = 25.2 + rng.normal(0, 0.03, n_cv)

    # -------------------------------------------------------------
    # Step 3: Rest Phase (I = 0, 1800s / 30 mins)
    # -------------------------------------------------------------
    n_rest = 80
    t_rest_rel = np.linspace(0, 1800, n_rest)
    t_rest = t_cv[-1] + t_rest_rel
    i_rest = np.zeros(n_rest)
    q_rest = np.full(n_rest, q_cv[-1])
    relaxation = 0.012 * np.exp(-t_rest_rel / 40.0)
    v_rest = 3.46 - (t_rest_rel * k_slope_v_s) + relaxation + rng.normal(0, 0.00005, n_rest)
    step_rest = ["REST"] * n_rest
    temp_rest = 25.0 + rng.normal(0, 0.02, n_rest)

    # -------------------------------------------------------------
    # Step 4: DCIR Pulse (10A discharge pulse for 2 seconds)
    # -------------------------------------------------------------
    t_pulse = np.array([t_rest[-1] + 1.0, t_rest[-1] + 2.0])
    i_pulse = np.array([-10.0, -10.0])
    v_pulse = np.array([
        v_rest[-1] - 10.0 * base_r_int + rng.normal(0, 0.0003),
        v_rest[-1] - 10.0 * base_r_int + rng.normal(0, 0.0003),
    ])
    q_pulse = np.array([q_rest[-1] - (10.0 * 1.0) / 3600.0, q_rest[-1] - (10.0 * 2.0) / 3600.0])
    step_pulse = ["PULSE_DCHG", "PULSE_DCHG"]
    temp_pulse = np.array([25.4, 25.5])

    # -------------------------------------------------------------
    # Step 5: CC Discharge (1.0A from 1.0 down to 0.02 SOC)
    # -------------------------------------------------------------
    n_dchg = 200
    soc_dchg = np.linspace(0.99, 0.02, n_dchg)
    q_dchg = (1.0 - soc_dchg) * actual_capacity_ah
    t_dchg = t_pulse[-1] + 5.0 + (q_dchg / 1.0) * 3600.0
    ocv_dchg = _lfp_ocv(soc_dchg)
    v_dchg = np.clip(ocv_dchg - 1.0 * base_r_int + rng.normal(0, 0.0003, n_dchg), 2.50, 3.65)
    i_dchg = np.full(n_dchg, -1.0)
    step_dchg = ["CC_DCHG"] * n_dchg
    temp_dchg = 25.1 + rng.normal(0, 0.04, n_dchg)

    # Assemble column arrays
    timestamp = np.concatenate([t_cc, t_cv, t_rest, t_pulse, t_dchg])
    current = np.concatenate([i_cc, i_cv, i_rest, i_pulse, i_dchg])
    voltage = np.concatenate([v_cc, v_cv, v_rest, v_pulse, v_dchg])
    capacity = np.concatenate([q_cc, q_cv, q_rest, q_pulse, q_dchg])
    temperature = np.concatenate([temp_cc, temp_cv, temp_rest, temp_pulse, temp_dchg])
    step_types = step_cc + step_cv + step_rest + step_pulse + step_dchg
    total_len = len(timestamp)

    return pl.DataFrame({
        "timestamp_s": np.round(timestamp, 2),
        "cell_id": [cell_id] * total_len,
        "channel_id": [channel_id] * total_len,
        "cycle_index": [cycle_index] * total_len,
        "step_type": step_types,
        "current_a": np.round(current, 4),
        "voltage_v": np.round(voltage, 4),
        "capacity_ah": np.round(capacity, 5),
        "temp_c": np.round(temperature, 2),
    })


def generate_formation_batch(
    batch_id: str = "BATCH_202610A",
    num_cells: int = 24,
    micro_short_rate: float = 0.08,
    high_dcir_rate: float = 0.08,
    low_capacity_rate: float = 0.08,
    random_seed: int = 42,
) -> pl.DataFrame:
    """Generate a multi-channel batch of cells for formation testing."""
    rng = np.random.default_rng(random_seed)
    dfs: List[pl.DataFrame] = []

    for idx in range(1, num_cells + 1):
        cell_id = f"CELL_{batch_id}_{idx:03d}"
        channel_id = idx

        has_micro = bool(rng.random() < micro_short_rate)
        has_dcir = bool(rng.random() < high_dcir_rate)
        has_low_cap = bool(rng.random() < low_capacity_rate)

        cell_df = generate_cell_run(
            cell_id=cell_id,
            channel_id=channel_id,
            has_micro_short=has_micro,
            has_high_dcir=has_dcir,
            has_low_capacity=has_low_cap,
            random_seed=random_seed + idx,
        )
        cell_df = cell_df.with_columns(pl.lit(batch_id).alias("batch_id"))
        dfs.append(cell_df)

    return pl.concat(dfs)
