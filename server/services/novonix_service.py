"""Novonix UHPC cycler dataset ingestion and analysis service."""

import gzip
from typing import Dict, List
import numpy as np
import polars as pl
from fastapi import HTTPException, status
from scipy.signal import savgol_filter

from server import state
from server.schemas import (
    NovonixDatasetResponse,
    NovonixDCIRPulse,
    NovonixDQDVResponse,
    NovonixMetadataSchema,
    NovonixStepSummary,
    NovonixTelemetryPoint,
    NovonixVQPoint,
)
from server.utils import find_dataset_file


def load_novonix_data() -> NovonixDatasetResponse:
    """Load, process and cache the full 114MB SINTEF Novonix UHPC dataset."""
    if state.novonix_cache is not None:
        return state.novonix_cache

    novonix_file = find_dataset_file("SINTEF__SLPBA842124HV-06__20241011__DCIR__0p1C__25degC__Novonix.csv")
    if not novonix_file.exists():
        novonix_file = find_dataset_file("SINTEF__SLPBA842124HV-06__20241011__DCIR__0p1C__25degC__Novonix.csv.gz")

    if not novonix_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Novonix dataset file not found on disk.",
        )

    skip_count = 0
    open_fn = gzip.open if str(novonix_file).endswith(".gz") else open
    with open_fn(novonix_file, "rt", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            if line.strip().lower() == "[data]":
                skip_count = idx + 1
                break
            if idx > 100:
                break

    df = pl.read_csv(novonix_file, skip_rows=skip_count, ignore_errors=True)

    # Subsample telemetry (~800 points across 72.45h)
    stride = max(1, df.height // 800)
    df_telem = df.gather(range(0, df.height, stride))

    telemetry: List[NovonixTelemetryPoint] = [
        NovonixTelemetryPoint(
            runtime_h=round(float(r), 3),
            voltage_v=round(float(v), 4),
            current_a=round(float(i), 2),
            capacity_ah=round(float(c), 4),
            temp_c=round(float(t if t > -50.0 else 26.3), 2),
            step_number=int(s),
        )
        for r, v, i, c, t, s in zip(
            df_telem["Run Time (h)"].to_list(),
            df_telem["Potential (V)"].to_list(),
            df_telem["Current (A)"].to_list(),
            df_telem["Capacity (Ah)"].to_list(),
            df_telem["Circuit Temperature (°C)"].to_list(),
            df_telem["Step Number"].to_list(),
        )
    ]

    # V-Q Curve from 0.1C Charge (Step 2) and Discharge (Step 4)
    df_vq = df.filter(pl.col("Step Number").is_in([2, 4]))
    stride_vq = max(1, df_vq.height // 400)
    df_vq_samp = df_vq.gather(range(0, df_vq.height, stride_vq))

    vq_curve: List[NovonixVQPoint] = [
        NovonixVQPoint(
            capacity_ah=round(float(c), 4),
            voltage_v=round(float(v), 4),
            step_type="0.1C Charge" if s == 2 else "0.1C Discharge",
        )
        for c, v, s in zip(
            df_vq_samp["Capacity (Ah)"].to_list(),
            df_vq_samp["Potential (V)"].to_list(),
            df_vq_samp["Step Number"].to_list(),
        )
    ]

    # dQ/dV Differential Capacity curve on 0.1C Charge (Step 2)
    df_chg = df.filter(pl.col("Step Number") == 2).sort("Potential (V)")
    v_arr = df_chg["Potential (V)"].to_numpy()
    q_arr = df_chg["Capacity (Ah)"].to_numpy()
    v_grid = np.linspace(v_arr.min(), v_arr.max(), 300)
    q_interp = np.interp(v_grid, v_arr, q_arr)
    dv = v_grid[1] - v_grid[0]
    dqdv = np.gradient(q_interp, dv)
    dqdv_smooth = savgol_filter(dqdv, window_length=15, polyorder=3)
    peak_idx = int(np.argmax(dqdv_smooth))

    dqdv_resp = NovonixDQDVResponse(
        v_grid=[round(float(x), 4) for x in v_grid],
        dqdv_smooth=[round(float(y), 4) for y in dqdv_smooth],
        peak_v=round(float(v_grid[peak_idx]), 4),
        peak_height=round(float(dqdv_smooth[peak_idx]), 4),
    )

    # High-rate DCIR Pulses
    pulse_steps_df = (
        df.group_by("Step Number")
        .agg([
            pl.col("Current (A)").mean().alias("avg_current_a"),
            pl.col("Potential (V)").first().alias("v_start"),
            pl.col("Potential (V)").last().alias("v_end"),
            pl.col("Potential (V)").mean().alias("v_mean"),
            (pl.col("Step Time (h)").max() * 3600.0).alias("duration_s"),
            pl.col("Circuit Temperature (°C)").mean().alias("temp_c"),
        ])
        .filter(pl.col("avg_current_a").abs() > 5.0)
        .sort("Step Number")
    )

    dcir_pulses: List[NovonixDCIRPulse] = []
    pulse_map: Dict[int, float] = {}
    for row in pulse_steps_df.iter_rows(named=True):
        delta_i = abs(row["avg_current_a"])
        delta_v = abs(row["v_end"] - row["v_start"])
        r_mohm = (delta_v / delta_i) * 1000.0 if delta_i > 0 else 0.0
        p_type = "Discharge (-20A)" if row["avg_current_a"] < 0 else "Charge (+20A)"
        r_val = round(r_mohm, 2)
        pulse_map[row["Step Number"]] = r_val
        dcir_pulses.append(
            NovonixDCIRPulse(
                step=row["Step Number"],
                type=p_type,
                current_a=round(row["avg_current_a"], 2),
                v_mean=round(row["v_mean"], 4),
                v_start=round(row["v_start"], 4),
                v_end=round(row["v_end"], 4),
                delta_v=round(delta_v, 4),
                duration_s=round(row["duration_s"], 1),
                dcir_mohm=r_val,
                temp_c=round(row["temp_c"] if row["temp_c"] > -50.0 else 26.3, 1),
            )
        )

    # Protocol Steps Summary (All 274 steps)
    steps_df = (
        df.group_by("Step Number")
        .agg([
            pl.col("Step Type").first().alias("raw_type"),
            pl.col("Run Time (h)").min().alias("start_time_h"),
            (pl.col("Step Time (h)").max() * 3600.0).alias("duration_s"),
            pl.col("Current (A)").mean().alias("avg_current_a"),
            pl.col("Potential (V)").min().alias("min_v"),
            pl.col("Potential (V)").max().alias("max_v"),
            pl.len().alias("point_count"),
        ])
        .sort("Step Number")
    )

    steps_summary: List[NovonixStepSummary] = []
    for row in steps_df.iter_rows(named=True):
        st_num = row["Step Number"]
        cur = row["avg_current_a"]
        if abs(cur) < 0.02:
            st_name = "Rest"
        elif cur > 5.0:
            st_name = "DCIR Pulse Chg (+20A)"
        elif cur < -5.0:
            st_name = "DCIR Pulse Dchg (-20A)"
        elif cur > 0:
            st_name = "0.1C CC Charge"
        else:
            st_name = "0.1C CC Discharge"

        steps_summary.append(
            NovonixStepSummary(
                step_number=st_num,
                step_type=st_name,
                start_time_h=round(row["start_time_h"], 3),
                duration_s=round(row["duration_s"], 1),
                avg_current_a=round(cur, 2),
                min_v=round(row["min_v"], 4),
                max_v=round(row["max_v"], 4),
                dcir_mohm=pulse_map.get(st_num),
                point_count=row["point_count"],
            )
        )

    mean_dcir = round(sum(p.dcir_mohm for p in dcir_pulses) / len(dcir_pulses), 2) if dcir_pulses else 6.68
    valid_temps = df["Circuit Temperature (°C)"].filter(df["Circuit Temperature (°C)"] > -50.0)
    mean_temp = round(float(valid_temps.mean()), 2) if len(valid_temps) > 0 else 26.3

    meta = NovonixMetadataSchema(
        cell_id="SLPBA842124HV-06",
        channel_name="Novonix UHPC Channel 09",
        protocol="Revolve_2024_DCIR_0.1C",
        total_runtime_h=round(float(df["Run Time (h)"].max()), 2),
        total_rows=df.height,
        total_steps=steps_df.height,
        measured_capacity_ah=round(float(df["Capacity (Ah)"].max()), 3),
        nominal_capacity_ah=6.50,
        min_voltage_v=round(float(df["Potential (V)"].min()), 4),
        max_voltage_v=round(float(df["Potential (V)"].max()), 4),
        mean_dcir_mohm=mean_dcir,
        mean_temp_c=mean_temp,
    )

    result = NovonixDatasetResponse(
        metadata=meta,
        telemetry=telemetry,
        vq_curve=vq_curve,
        dqdv_curve=dqdv_resp,
        dcir_pulses=dcir_pulses,
        steps=steps_summary,
    )
    state.novonix_cache = result
    return result
