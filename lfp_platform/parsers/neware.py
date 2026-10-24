"""Parser for Neware battery testing system exports."""

from pathlib import Path
from typing import Union
import numpy as np
import polars as pl
from lfp_platform.parsers.base import BaseCyclerParser


class NewareParser(BaseCyclerParser):
    """Parses Neware BTS-4000 / BTS-8000 CSV time-series exports with automatic time bug resolution."""

    def parse(self, file_path: Union[str, Path], cell_id: str, channel_id: int = 1) -> pl.DataFrame:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Neware file not found: {path}")

        raw_df = pl.read_csv(path, infer_schema_length=10000, ignore_errors=True)
        col_map = {}

        # First pass: map unambiguously
        has_total_time = any("total time" in c.lower() for c in raw_df.columns)
        has_step_time = any(c.lower() in ["time(s)", "step time(s)", "steptime"] for c in raw_df.columns)

        for col in raw_df.columns:
            c_lower = col.lower()
            if "total time" in c_lower:
                col_map[col] = "raw_total_time_s"
            elif c_lower in ["time(s)", "step time(s)", "steptime"]:
                col_map[col] = "step_time_s"
            elif "current(a)" in c_lower or ("current" in c_lower and "a" in c_lower):
                col_map[col] = "current_a"
            elif "voltage(v)" in c_lower or ("voltage" in c_lower and "v" in c_lower):
                col_map[col] = "voltage_v"
            elif "capacity(ah)" in c_lower or ("capacity" in c_lower and "ah" in c_lower):
                col_map[col] = "capacity_ah"
            elif "cycle" in c_lower:
                col_map[col] = "cycle_index"
            elif "step index" in c_lower or c_lower == "step":
                col_map[col] = "step_index"
            elif "step type" in c_lower:
                col_map[col] = "raw_step_type"
            elif "temperature" in c_lower or "temp" in c_lower or "t1" in c_lower:
                if "temp_c" not in col_map.values():
                    col_map[col] = "temp_c"

        df = raw_df.rename(col_map)

        # Monotonic timestamp reconstruction (Sanitizing Neware Time Bug)
        if "step_index" in df.columns and "step_time_s" in df.columns:
            step_idx = df["step_index"].to_numpy()
            step_time = df["step_time_s"].to_numpy()
            steps = np.unique(step_idx)
            cum_time = np.zeros_like(step_time, dtype=float)
            offset = 0.0
            for s in steps:
                mask = (step_idx == s)
                st = step_time[mask]
                cum_time[mask] = offset + st
                if len(st) > 0:
                    offset += st[-1]
            df = df.with_columns(pl.Series("timestamp_s", cum_time))
        elif "raw_total_time_s" in df.columns:
            df = df.with_columns(pl.col("raw_total_time_s").alias("timestamp_s"))
        elif "step_time_s" in df.columns:
            df = df.with_columns(pl.col("step_time_s").alias("timestamp_s"))
        else:
            df = df.with_columns(pl.int_range(0, df.height).alias("timestamp_s"))

        if "cycle_index" not in df.columns:
            df = df.with_columns(pl.lit(1).alias("cycle_index"))
        if "temp_c" not in df.columns:
            df = df.with_columns(pl.lit(25.0).alias("temp_c"))

        # Infer canonical step type
        if "raw_step_type" in df.columns:
            df = df.with_columns(
                pl.when(pl.col("raw_step_type").str.to_lowercase().str.contains("rest"))
                .then(pl.lit("REST"))
                .when(pl.col("raw_step_type").str.to_lowercase().str.contains("chg"))
                .then(pl.lit("CC_CHG"))
                .when(pl.col("current_a") < -2.0)
                .then(pl.lit("PULSE_DCHG"))
                .otherwise(pl.lit("CC_DCHG"))
                .alias("step_type")
            )
        else:
            df = df.with_columns(
                pl.when(pl.col("current_a").abs() < 0.01)
                .then(pl.lit("REST"))
                .when(pl.col("current_a") > 0.05)
                .then(pl.lit("CC_CHG"))
                .when(pl.col("current_a") < -2.0)
                .then(pl.lit("PULSE_DCHG"))
                .otherwise(pl.lit("CC_DCHG"))
                .alias("step_type")
            )

        df = df.with_columns([
            pl.lit(cell_id).alias("cell_id"),
            pl.lit(channel_id).alias("channel_id"),
        ])

        canonical_df = df.select([
            "timestamp_s",
            "cell_id",
            "channel_id",
            "cycle_index",
            "step_type",
            "current_a",
            "voltage_v",
            "capacity_ah",
            "temp_c",
        ])

        self.validate_schema(canonical_df)
        return canonical_df
