"""Base interface and canonical schema for cycler log parsers."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Union
import polars as pl


CANONICAL_COLUMNS = [
    "timestamp_s",
    "cell_id",
    "channel_id",
    "cycle_index",
    "step_type",
    "current_a",
    "voltage_v",
    "capacity_ah",
    "temp_c",
]


class BaseCyclerParser(ABC):
    """Abstract base class for battery cycler log parsers."""

    @abstractmethod
    def parse(self, file_path: Union[str, Path], cell_id: str, channel_id: int = 1) -> pl.DataFrame:
        """Parse raw cycler file and return normalized Polars DataFrame."""
        pass

    @classmethod
    def validate_schema(cls, df: pl.DataFrame) -> bool:
        """Validate that all canonical columns exist with expected types."""
        missing = [col for col in CANONICAL_COLUMNS if col not in df.columns]
        if missing:
            raise ValueError(f"Normalized DataFrame is missing canonical columns: {missing}")
        return True
