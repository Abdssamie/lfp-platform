"""Verification script to compute K-values (dV/dt) from real open-source battery datasets:
1. NASA Ames Prognostics Center of Excellence (PCoE) Li-ion aging & rest intervals.
2. LG Chem 50Ah LFP GITT (Galvanostatic Intermittent Titration) 2-hour rest steps.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime
import scipy.io
import pandas as pd
import polars as pl
from lfp_platform.analytics.screening import compute_k_value

def verify_nasa_dataset():
    mat_path = Path("data/public_datasets/nasa_pcoe/B0025.mat")
    if not mat_path.exists():
        print(f"NASA dataset not found at {mat_path}")
        return

    print("=" * 70)
    print("1. NASA Ames PCoE Battery Dataset (B0025) - Multi-Hour & Multi-Day Rest")
    print("=" * 70)

    mat = scipy.io.loadmat(mat_path)
    cycles = mat["B0025"][0, 0]["cycle"][0]

    verified_rests = []
    for i in range(len(cycles) - 1):
        c1 = cycles[i]
        c2 = cycles[i + 1]
        t1_raw = c1["time"][0]
        t2_raw = c2["time"][0]
        dt1 = datetime(int(t1_raw[0]), int(t1_raw[1]), int(t1_raw[2]), int(t1_raw[3]), int(t1_raw[4]), int(t1_raw[5]))
        dt2 = datetime(int(t2_raw[0]), int(t2_raw[1]), int(t2_raw[2]), int(t2_raw[3]), int(t2_raw[4]), int(t2_raw[5]))
        gap_h = (dt2 - dt1).total_seconds() / 3600.0

        t1 = str(c1["type"][0])
        t2 = str(c2["type"][0])

        if gap_h >= 2.0 and t1 == "charge":
            v_start = float(c1["data"][0, 0]["Voltage_measured"][0][-1])
            v_end = float(c2["data"][0, 0]["Voltage_measured"][0][0]) if "Voltage_measured" in c2["data"][0, 0].dtype.names else None
            if v_end is not None:
                dv_mv = (v_start - v_end) * 1000.0
                dt_days = gap_h / 24.0
                k_val = dv_mv / dt_days
                is_defect = k_val >= 0.50
                verified_rests.append({
                    "step_pair": f"Step {i} -> {i+1}",
                    "rest_hours": round(gap_h, 2),
                    "v_start": round(v_start, 4),
                    "v_end": round(v_end, 4),
                    "drop_mv": round(dv_mv, 2),
                    "k_value_mv_day": round(k_val, 4),
                    "is_micro_short": is_defect,
                    "screening": "QUARANTINE (Fail)" if is_defect else "PASS (Normal)",
                })

    df_nasa = pd.DataFrame(verified_rests)
    print(df_nasa.to_string(index=False))
    print(f"\nTotal rest intervals analyzed: {len(df_nasa)}")
    print(f"Normal self-discharge (K < 0.50 mV/d): {(~df_nasa['is_micro_short']).sum()}")
    print(f"Micro-short / elevated discharge (K >= 0.50 mV/d): {df_nasa['is_micro_short'].sum()}")


def verify_gitt_dataset():
    gitt_path = Path("data/lfp_lg_chem_csv/gitt/gitt_0_17C.csv")
    if not gitt_path.exists():
        print(f"GITT dataset not found at {gitt_path}")
        return

    print("\n" + "=" * 70)
    print("2. LG Chem 50Ah LFP GITT Dataset - 2-Hour In-Situ Rest Steps")
    print("=" * 70)

    # Read GITT sample
    df = pd.read_csv(gitt_path)
    df["is_rest"] = df["current_a"].abs() < 0.005
    df["rest_block"] = (df["is_rest"] != df["is_rest"].shift()).cumsum()

    sample_blocks = [185, 191, 195, 205, 209]
    gitt_results = []

    for b in sample_blocks:
        grp = df[(df["is_rest"]) & (df["rest_block"] == b)].copy()
        if grp.empty:
            continue
        dur_s = float(grp["time_s"].iloc[-1] - grp["time_s"].iloc[0])
        v_start = float(grp["voltage_v"].iloc[0])
        v_end = float(grp["voltage_v"].iloc[-1])
        soc = float(grp["soc"].iloc[0])

        grp["timestamp_s"] = grp["time_s"]
        pl_rest = pl.from_pandas(grp[["timestamp_s", "voltage_v"]])
        k_val, r2, is_micro = compute_k_value(pl_rest, settling_time_s=600.0)

        gitt_results.append({
            "block_id": b,
            "soc": round(soc, 3),
            "duration_h": round(dur_s / 3600.0, 2),
            "v_start": round(v_start, 4),
            "v_end": round(v_end, 4),
            "k_value_mv_day": k_val,
            "r2": r2,
            "is_micro_short": is_micro,
        })

    df_gitt = pd.DataFrame(gitt_results)
    print(df_gitt.to_string(index=False))

if __name__ == "__main__":
    verify_nasa_dataset()
    verify_gitt_dataset()
