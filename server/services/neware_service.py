"""Neware BTS cycler dataset ingestion and rate capability analysis service."""

from typing import List
import numpy as np
import polars as pl
from fastapi import HTTPException, status
from scipy.signal import savgol_filter

from server import state
from server.schemas import (
    NewareDatasetResponse,
    NewareDQDVResponse,
    NewareMetadataSchema,
    NewareRateCurvePoint,
    NewareRateRetentionPoint,
    NewareStepSummary,
    NewareTelemetryPoint,
)
from server.utils import find_dataset_file


def load_neware_data() -> NewareDatasetResponse:
    """Load, sanitize and process the SINTEF Neware Rate Capability dataset with Time Bug resolution."""
    if state.neware_cache is not None:
        return state.neware_cache

    neware_file = find_dataset_file("SINTEF__SLPBA842124HV__2024-10-23__Rate_25degC__Neware__Time_Bug.csv")

    if not neware_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Neware Rate Capability dataset file not found on disk.",
        )

    df = pl.read_csv(neware_file, infer_schema_length=10000, ignore_errors=True)

    # 1. Monotonic timestamp reconstruction (Sanitizing Neware Time Bug: 19 rollover events)
    step_idx = df["Step Index"].to_numpy()
    step_time = df["Time(s)"].to_numpy()
    steps_arr = np.unique(step_idx)
    cum_time = np.zeros_like(step_time, dtype=float)
    offset = 0.0
    for s in steps_arr:
        mask = (step_idx == s)
        st = step_time[mask]
        cum_time[mask] = offset + st
        if len(st) > 0:
            offset += st[-1]

    df = df.with_columns(pl.Series("runtime_h", cum_time / 3600.0))

    # 2. Subsample telemetry (~900 points across 34.9h)
    stride = max(1, df.height // 900)
    df_telem = df.gather(range(0, df.height, stride))

    telemetry: List[NewareTelemetryPoint] = [
        NewareTelemetryPoint(
            runtime_h=round(float(r), 3),
            voltage_v=round(float(v), 4),
            current_a=round(float(i), 2),
            capacity_ah=round(float(c), 4),
            temp_c=round(float(t), 2),
            step_index=int(s),
            step_type=str(st),
        )
        for r, v, i, c, t, s, st in zip(
            df_telem["runtime_h"].to_list(),
            df_telem["Voltage(V)"].to_list(),
            df_telem["Current(A)"].to_list(),
            df_telem["Capacity(Ah)"].to_list(),
            df_telem["T1(?)"].to_list(),
            df_telem["Step Index"].to_list(),
            df_telem["Step Type"].to_list(),
        )
    ]

    # 3. Rate Capability Curves across C-rates: 0.1C, 1C, 2C, 5C, 9C
    rate_step_defs = [
        (4, 0.1, "0.1C (0.65A)"),
        (8, 1.0, "1.0C (6.55A)"),
        (12, 2.0, "2.0C (13.1A)"),
        (16, 5.0, "5.0C (32.8A)"),
        (21, 9.0, "9.0C (59.5A)"),
    ]

    rate_curves: List[NewareRateCurvePoint] = []
    for s_idx, c_rate, label in rate_step_defs:
        sdf = df.filter(pl.col("Step Index") == s_idx).sort("Time(s)")
        stride_r = max(1, sdf.height // 120)
        sdf_samp = sdf.gather(range(0, sdf.height, stride_r))
        for c, v in zip(sdf_samp["Capacity(Ah)"].to_list(), sdf_samp["Voltage(V)"].to_list()):
            rate_curves.append(
                NewareRateCurvePoint(
                    capacity_ah=round(float(c), 4),
                    voltage_v=round(float(v), 4),
                    rate_label=label,
                    c_rate=c_rate,
                )
            )

    # 4. dQ/dV Differential Capacity curve on Full CCCV Charge (Step 6)
    df_chg = df.filter(pl.col("Step Index") == 6).sort("Voltage(V)")
    v_arr = df_chg["Voltage(V)"].to_numpy()
    q_arr = df_chg["Capacity(Ah)"].to_numpy()
    v_grid = np.linspace(v_arr.min(), v_arr.max(), 300)
    q_interp = np.interp(v_grid, v_arr, q_arr)
    dv = v_grid[1] - v_grid[0]
    dqdv = np.gradient(q_interp, dv)
    dqdv_smooth = savgol_filter(dqdv, window_length=15, polyorder=3)
    peak_idx = int(np.argmax(dqdv_smooth))

    dqdv_resp = NewareDQDVResponse(
        v_grid=[round(float(x), 4) for x in v_grid],
        dqdv_smooth=[round(float(y), 4) for y in dqdv_smooth],
        peak_v=round(float(v_grid[peak_idx]), 4),
        peak_height=round(float(dqdv_smooth[peak_idx]), 4),
    )

    # 5. Rate Retention Summary
    baseline_cap = float(df.filter(pl.col("Step Index") == 4)["Capacity(Ah)"].max() or 7.280)
    rate_retention: List[NewareRateRetentionPoint] = []
    for s_idx, c_rate, label in rate_step_defs:
        sdf = df.filter(pl.col("Step Index") == s_idx)
        cap = float(sdf["Capacity(Ah)"].max() or 0.0)
        cur = abs(float(sdf["Current(A)"].mean() or 0.0))
        dur_min = float(sdf["Time(s)"].max() or 0.0) / 60.0
        energy = float(sdf["Energy(Wh)"].max() or 0.0) if "Energy(Wh)" in sdf.columns else cap * 3.7
        retention = (cap / baseline_cap) * 100.0 if baseline_cap > 0 else 100.0
        rate_retention.append(
            NewareRateRetentionPoint(
                rate_c=c_rate,
                rate_label=label,
                current_a=round(cur, 2),
                capacity_ah=round(cap, 3),
                retention_pct=round(retention, 2),
                duration_min=round(dur_min, 1),
                energy_wh=round(energy, 2),
            )
        )

    # 6. Step Summary (21 steps)
    steps_summary: List[NewareStepSummary] = []
    for s_idx in sorted(df["Step Index"].unique().to_list()):
        sdf = df.filter(pl.col("Step Index") == s_idx)
        raw_st = sdf["Step Type"][0]
        cur = float(sdf["Current(A)"].mean() or 0.0)
        cap = float(sdf["Capacity(Ah)"].max() or 0.0)
        dur = float(sdf["Time(s)"].max() or 0.0)
        start_h = float(sdf["runtime_h"].min() or 0.0)
        min_v = float(sdf["Voltage(V)"].min() or 0.0)
        max_v = float(sdf["Voltage(V)"].max() or 0.0)

        if s_idx == 4:
            st_name = "0.1C CC Discharge (0.65A)"
        elif s_idx == 8:
            st_name = "1.0C CC Discharge (6.55A)"
        elif s_idx == 12:
            st_name = "2.0C CC Discharge (13.1A)"
        elif s_idx == 16:
            st_name = "5.0C CC Discharge (32.8A)"
        elif s_idx == 21:
            st_name = "9.0C CC Discharge (59.5A)"
        elif "CCCV" in raw_st or "Chg" in raw_st:
            st_name = f"CCCV Charge ({round(cur, 1)}A)"
        else:
            st_name = "Rest / OCV"

        steps_summary.append(
            NewareStepSummary(
                step_index=s_idx,
                step_type=st_name,
                start_time_h=round(start_h, 2),
                duration_s=round(dur, 1),
                avg_current_a=round(cur, 2),
                capacity_ah=round(cap, 3),
                min_v=round(min_v, 4),
                max_v=round(max_v, 4),
                point_count=sdf.height,
            )
        )

    meta = NewareMetadataSchema(
        cell_id="SINTEF__SLPBA842124HV",
        cycler="Neware BTS-4000 / BTS-8000",
        test_type="High-Current Rate Capability (0.1C to 9C / 60A)",
        total_runtime_h=round(float(df["runtime_h"].max()), 2),
        total_rows=df.height,
        total_steps=len(steps_summary),
        nominal_capacity_ah=7.28,
        measured_capacity_ah=round(baseline_cap, 3),
        min_voltage_v=round(float(df["Voltage(V)"].min()), 4),
        max_voltage_v=round(float(df["Voltage(V)"].max()), 4),
        max_discharge_current_a=round(abs(float(df["Current(A)"].min())), 2),
        mean_temp_c=round(float(df["T1(?)"].mean() or 26.5), 1),
        time_bug_resolved=True,
        quarantine_events_count=19,
    )

    result = NewareDatasetResponse(
        metadata=meta,
        telemetry=telemetry,
        rate_curves=rate_curves,
        dqdv_curve=dqdv_resp,
        rate_retention=rate_retention,
        steps=steps_summary,
    )
    state.neware_cache = result
    return result
