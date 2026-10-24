"""Tests for LFP Formation & Aging Analytics Pipeline."""

import pytest
import numpy as np
import polars as pl
from lfp_platform.generator import generate_cell_run, generate_formation_batch
from lfp_platform.analytics.dqdv import compute_dqdv
from lfp_platform.analytics.screening import compute_k_value, compute_dcir, screen_cell
from lfp_platform.analytics.spc import calculate_capability, grade_cell
from lfp_platform.pipeline import process_batch
from lfp_platform.models import CellGrade


def test_synthetic_cell_generation():
    """Verify generated cell time-series has required steps and non-empty columns."""
    df = generate_cell_run("TEST_CELL_01", channel_id=1, random_seed=123)
    assert not df.is_empty()
    steps = df["step_type"].unique().to_list()
    assert "CC_CHG" in steps
    assert "CV_CHG" in steps
    assert "REST" in steps
    assert "PULSE_DCHG" in steps
    assert "CC_DCHG" in steps

    # Check realistic voltage bounds for LFP
    assert df["voltage_v"].min() >= 2.45
    assert df["voltage_v"].max() <= 3.70


def test_micro_short_detection():
    """Verify that micro-shorted cell generates high K-value and is detected."""
    # Defective cell
    df_defective = generate_cell_run("BAD_CELL", channel_id=1, has_micro_short=True, random_seed=42)
    screening_defective = screen_cell(df_defective)
    assert screening_defective.k_value_mv_day >= 0.50
    assert screening_defective.is_micro_short is True

    # Nominal healthy cell
    df_nominal = generate_cell_run("GOOD_CELL", channel_id=2, has_micro_short=False, random_seed=43)
    screening_nominal = screen_cell(df_nominal)
    assert screening_nominal.k_value_mv_day < 0.50
    assert screening_nominal.is_micro_short is False


def test_dcir_pulse_calculation():
    """Verify DCIR extraction from pulse step."""
    df_cell = generate_cell_run("CELL_DCIR", channel_id=1, has_high_dcir=False, random_seed=10)
    screening = screen_cell(df_cell)
    # Nominal LFP internal resistance is between 15 and 35 mOhm
    assert 15.0 <= screening.dcir_mohm <= 35.0
    assert screening.dcir_pulse_current_a == pytest.approx(10.0, rel=0.1)


def test_dqdv_differentiation_and_peak():
    """Verify Savitzky-Golay dQ/dV identifies primary LFP phase transition peak."""
    df_cell = generate_cell_run("CELL_DQDV", channel_id=1, random_seed=99)
    df_chg = df_cell.filter(pl.col("step_type") == "CC_CHG")
    v_grid, dqdv_smooth, peaks = compute_dqdv(df_chg)

    assert len(v_grid) > 0
    assert len(dqdv_smooth) > 0
    assert len(peaks) >= 1
    # Primary LFP phase transition peak occurs between 3.38V and 3.46V
    primary = peaks[0]
    assert 3.38 <= primary.peak_voltage_v <= 3.48
    assert primary.peak_height > 0.0


def test_spc_capability_calculation():
    """Verify Cpk calculation with known distribution."""
    # Standard normal distribution centered at 3.20 Ah with sigma = 0.03
    np.random.seed(42)
    values = np.random.normal(loc=3.20, scale=0.03, size=100)
    usl, lsl = 3.35, 3.05
    spc = calculate_capability(values, usl=usl, lsl=lsl, subgroup_size=5)

    assert spc.mean == pytest.approx(3.20, abs=0.02)
    assert spc.cpk > 1.20


def test_batch_pipeline_and_grading():
    """Verify end-to-end batch processing and grading."""
    batch_df = generate_formation_batch(
        batch_id="TEST_BATCH",
        num_cells=12,
        micro_short_rate=0.15,
        random_seed=777,
    )
    result = process_batch(batch_df)

    assert result.total_cells == 12
    assert result.grade_a_count + result.grade_b_count + result.scrap_count == 12
    assert result.yield_pct > 0.0
