"""Tests for cycler log parsers (Arbin and Neware)."""

import pytest
import polars as pl
from pathlib import Path
from lfp_platform.parsers.arbin import ArbinParser
from lfp_platform.parsers.neware import NewareParser


def test_arbin_parser(tmp_path: Path):
    """Verify parsing and schema normalization of Arbin CSV data."""
    csv_file = tmp_path / "arbin_sample.csv"
    csv_file.write_text(
        "Test_Time(s),Current(A),Voltage(V),Charge_Capacity(Ah),Discharge_Capacity(Ah),Cycle_Index,Temp(C)\n"
        "0.0,0.0,3.32,0.0,0.0,1,25.0\n"
        "1.0,1.5,3.34,0.0004,0.0,1,25.1\n"
        "2.0,1.5,3.38,0.0008,0.0,1,25.1\n"
        "3.0,0.0,3.42,0.0008,0.0,1,25.0\n"
        "4.0,-2.5,3.30,0.0008,0.0007,1,25.3\n"
    )

    parser = ArbinParser()
    df = parser.parse(csv_file, cell_id="CELL_ARBIN_01", channel_id=3)

    assert df.height == 5
    assert "timestamp_s" in df.columns
    assert "cell_id" in df.columns
    assert "step_type" in df.columns
    assert df["step_type"].to_list() == ["REST", "CC_CHG", "CC_CHG", "REST", "PULSE_DCHG"]


def test_neware_parser(tmp_path: Path):
    """Verify parsing and schema normalization of Neware BTS CSV data."""
    csv_file = tmp_path / "neware_sample.csv"
    csv_file.write_text(
        "Total Time,Current(A),Voltage(V),Capacity(Ah),Cycle,Temperature(C)\n"
        "0.0,0.0,3.33,0.0,1,24.8\n"
        "1.0,1.0,3.35,0.0003,1,24.9\n"
        "2.0,-1.0,3.31,0.0003,1,25.0\n"
    )

    parser = NewareParser()
    df = parser.parse(csv_file, cell_id="CELL_NEWARE_01", channel_id=5)

    assert df.height == 3
    assert df["cell_id"][0] == "CELL_NEWARE_01"
    assert df["channel_id"][0] == 5
    assert df["step_type"].to_list() == ["REST", "CC_CHG", "CC_DCHG"]
