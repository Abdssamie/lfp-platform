"""Parser for Arbin cycler logs (CSV and binary exports)."""

from pathlib import Path
from typing import Union
import polars as pl
from lfp_platform.parsers.base import BaseCyclerParser


class ArbinParser(BaseCyclerParser):
    """Parses Arbin Instruments time-series exports."""

    def parse(self, file_path: Union[str, Path], cell_id: str, channel_id: int = 1) -> pl.DataFrame:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Arbin file not found: {path}")

        # Standard Arbin CSV export schema mapping
        raw_df = pl.read_csv(path, ignore_errors=True)
        col_map = {}
        for col in raw_df.columns:
            c_lower = col.lower()
            if "test_time" in c_lower or "testtime" in c_lower:
                col_map[col] = "timestamp_s"
            elif "current" in c_lower and "a" in c_lower:
                col_map[col] = "current_a"
            elif "voltage" in c_lower and "v" in c_lower:
                col_map[col] = "voltage_v"
            elif "discharge_capacity" in c_lower or "discharge capacity" in c_lower:
                col_map[col] = "discharge_capacity_ah"
            elif "charge_capacity" in c_lower or "charge capacity" in c_lower:
                col_map[col] = "charge_capacity_ah"
            elif "capacity" in c_lower and "ah" in c_lower:
                col_map[col] = "capacity_ah"

            elif "cycle" in c_lower:
                col_map[col] = "cycle_index"
            elif "temp" in c_lower:
                col_map[col] = "temp_c"
            elif "step_index" in c_lower or "step" in c_lower:
                col_map[col] = "step_index"

        df = raw_df.rename(col_map)

        # Merge capacity if separate charge/discharge columns exist
        if "capacity_ah" not in df.columns:
            if "charge_capacity_ah" in df.columns and "discharge_capacity_ah" in df.columns:
                df = df.with_columns(
                    pl.max_horizontal(
                        pl.col("charge_capacity_ah").fill_null(0.0),
                        pl.col("discharge_capacity_ah").fill_null(0.0),
                    ).alias("capacity_ah")
                )
            elif "charge_capacity_ah" in df.columns:
                df = df.with_columns(pl.col("charge_capacity_ah").alias("capacity_ah"))
            elif "discharge_capacity_ah" in df.columns:
                df = df.with_columns(pl.col("discharge_capacity_ah").alias("capacity_ah"))
            else:
                df = df.with_columns(pl.lit(0.0).alias("capacity_ah"))

        # Fallbacks for missing columns
        if "timestamp_s" not in df.columns:
            df = df.with_columns(pl.int_range(0, df.height).alias("timestamp_s"))
        if "cycle_index" not in df.columns:
            df = df.with_columns(pl.lit(1).alias("cycle_index"))
        if "temp_c" not in df.columns:
            df = df.with_columns(pl.lit(25.0).alias("temp_c"))


        # Infer step type from current and voltage
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
