"""Test suite to verify all Plotly chart generators execute without error."""

import pytest
from lfp_platform.generator import generate_formation_batch
from lfp_platform.pipeline import process_batch
from lfp_platform.visualization.charts import (
    create_telemetry_fig,
    create_vq_fig,
    create_dqdv_fig,
    create_screening_scatter_fig,
    create_spc_xbar_fig,
)


def test_all_charts_build_cleanly():
    """Verify that all chart generation functions execute with valid Plotly figures."""
    df_batch = generate_formation_batch(batch_id="CHART_TEST_BATCH", num_cells=6, random_seed=42)
    res = process_batch(df_batch)

    # 1. Telemetry and V-Q figures
    first_cell_id = res.evaluations[0].cell_id
    df_cell = res.raw_df.filter(res.raw_df["cell_id"] == first_cell_id)

    fig_telemetry = create_telemetry_fig(df_cell)
    assert fig_telemetry is not None

    fig_vq = create_vq_fig(df_cell)
    assert fig_vq is not None

    # 2. dQ/dV figure
    v_grid, dqdv_smooth, peaks = res.dqdv_curves[first_cell_id]
    fig_dqdv = create_dqdv_fig(v_grid, dqdv_smooth, peaks, first_cell_id)
    assert fig_dqdv is not None

    # 3. Screening scatter figure
    fig_screening = create_screening_scatter_fig(res.evaluations)
    assert fig_screening is not None

    # 4. SPC chart figure
    fig_spc = create_spc_xbar_fig(res.evaluations, res.spc_capacity)
    assert fig_spc is not None
