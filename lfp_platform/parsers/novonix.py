"""Parser for Novonix UHPC (Ultra-High Precision Battery Cycler) CSV exports."""

from pathlib import Path
from typing import Union
import polars as pl
from lfp_platform.parsers.base import BaseCyclerParser


class NovonixParser(BaseCyclerParser):
    """Parses Novonix UHPC data files with header metadata blocks."""

    def parse(self, file_path: Union[str, Path], cell_id: str, channel_id: int = 1) -> pl.DataFrame:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Novonix file not found: {path}")

        # Scan for line containing "[Data]" header
        skip_count = 0
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for idx, line in enumerate(f):
                if line.strip().lower() == "[data]":
                    skip_count = idx + 1
                    break
                if idx > 100:  # safety ceiling
                    break

        # Read CSV with Polars starting at header line right after [Data]
        raw_df = pl.read_csv(path, skip_rows=skip_count, ignore_errors=True)

        col_map = {}
        for col in raw_df.columns:
            c_clean = col.strip().lower()
            if "run time" in c_clean or "runtime" in c_clean:
                col_map[col] = "runtime_h"
            elif "current" in c_clean:
                col_map[col] = "current_a"
            elif "potential" in c_clean or "voltage" in c_clean:
                col_map[col] = "voltage_v"
            elif "capacity" in c_clean:
                col_map[col] = "capacity_ah"
            elif "cycle number" in c_clean or "cycle" in c_clean:
                col_map[col] = "cycle_index"
            elif "circuit temperature" in c_clean:
                col_map[col] = "temp_c"
            elif "step type" in c_clean:
                col_map[col] = "raw_step_type"

        df = raw_df.rename(col_map)

        # Convert Run Time (h) to timestamp_s
        if "runtime_h" in df.columns:
            df = df.with_columns((pl.col("runtime_h").cast(pl.Float64) * 3600.0).alias("timestamp_s"))
        elif "timestamp_s" not in df.columns:
            df = df.with_columns(pl.int_range(0, df.height).cast(pl.Float64).alias("timestamp_s"))

        # Fallback columns
        if "cycle_index" not in df.columns:
            df = df.with_columns(pl.lit(1).alias("cycle_index"))
        if "temp_c" not in df.columns:
            df = df.with_columns(pl.lit(25.0).alias("temp_c"))
        else:
            # Replace placeholder error temps like -9999.0 with 25.0
            df = df.with_columns(
                pl.when(pl.col("temp_c") < -50.0)
                .then(pl.lit(25.0))
                .otherwise(pl.col("temp_c"))
                .alias("temp_c")
            )

        # Map step type
        if "raw_step_type" in df.columns:
            df = df.with_columns(
                pl.when(pl.col("raw_step_type") == 0)
                .then(pl.lit("REST"))
                .when(pl.col("raw_step_type") == 1)
                .then(pl.lit("CC_CHG"))
                .when((pl.col("raw_step_type") == 2) & (pl.col("current_a") < -2.0))
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
            pl.lit(channel_id).cast(pl.Int64).alias("channel_id"),
            pl.col("cycle_index").cast(pl.Int64).alias("cycle_index"),
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
