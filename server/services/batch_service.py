"""Batch generation, QC evaluation, screening, and SPC analysis service."""

from typing import List, Optional
import polars as pl
from fastapi import HTTPException, status

from lfp_platform.generator import generate_formation_batch
from lfp_platform.parsers.neware import NewareParser
from lfp_platform.parsers.novonix import NovonixParser
from lfp_platform.pipeline import BatchAnalysisResult, process_batch
from server import state
from server.schemas import (
    BatchRunRequest,
    BatchSummaryResponse,
    CellDetailResponse,
    CellEvaluationSchema,
    CellGradeEnum,
    DQDVPeakSchema,
    DQDVPhaseCurve,
    MicroShortAlertSchema,
    ScreeningScatterPoint,
    ScreeningScatterResponse,
    SPCMetricSummarySchema,
    SPCPositionPoint,
    SPCSummaryResponse,
    TelemetryPoint,
    VQCurvePoint,
)
from server.utils import find_dataset_file


def format_cell_evaluation(evaluation) -> CellEvaluationSchema:
    """Format core domain evaluation to API schema."""
    return CellEvaluationSchema(
        cell_id=evaluation.cell_id,
        channel_id=evaluation.channel_id,
        batch_id=evaluation.batch_id,
        nominal_capacity_ah=evaluation.nominal_capacity_ah,
        actual_capacity_ah=round(evaluation.actual_capacity_ah, 4),
        capacity_retention_pct=round(evaluation.capacity_retention_pct, 2),
        coulombic_efficiency_pct=round(evaluation.coulombic_efficiency_pct, 2),
        dcir_mohm=round(evaluation.dcir_mohm, 2),
        k_value_mv_day=round(evaluation.k_value_mv_day, 4),
        primary_peak_v=round(evaluation.primary_peak_v, 4),
        primary_peak_height=round(evaluation.primary_peak_height, 4),
        grade=CellGradeEnum(evaluation.grade.value),
        failure_reasons=evaluation.failure_reasons,
    )


def format_spc_summary(spc) -> SPCMetricSummarySchema:
    """Format SPC summary to API schema."""
    return SPCMetricSummarySchema(
        metric_name=spc.metric_name,
        mean=round(spc.mean, 4),
        std_dev=round(spc.std_dev, 4),
        usl=round(spc.usl, 4),
        lsl=round(spc.lsl, 4),
        ucl=round(spc.ucl, 4),
        lcl=round(spc.lcl, 4),
        cp=round(spc.cp, 2),
        cpk=round(spc.cpk, 2),
        pp=round(spc.pp, 2),
        ppk=round(spc.ppk, 2),
        is_capable=spc.is_capable,
    )


def build_batch_summary(result: BatchAnalysisResult) -> BatchSummaryResponse:
    """Construct full batch summary response."""
    micro_shorts = [e for e in result.evaluations if e.k_value_mv_day >= 0.50]
    has_hazard = len(micro_shorts) > 0
    quarantined = [e.channel_id for e in micro_shorts]

    if has_hazard:
        channels_str = ", ".join([f"CH {ch:02d}" for ch in quarantined])
        alert_msg = (
            f"CRITICAL SAFETY HAZARD: {len(micro_shorts)} cell(s) exceeded K-value threshold "
            f"(>= 0.50 mV/d) on {channels_str}. Quarantined from EV pack assembly."
        )
    else:
        alert_msg = "All channels within normal self-discharge limits (K < 0.50 mV/day)."

    return BatchSummaryResponse(
        batch_id=result.batch_id,
        total_cells=result.total_cells,
        grade_a_count=result.grade_a_count,
        grade_b_count=result.grade_b_count,
        scrap_count=result.scrap_count,
        yield_pct=round(result.yield_pct, 1),
        spc_capacity=format_spc_summary(result.spc_capacity),
        micro_short_alert=MicroShortAlertSchema(
            has_hazard=has_hazard,
            quarantined_channels=quarantined,
            alert_message=alert_msg,
        ),
        evaluations=[format_cell_evaluation(e) for e in result.evaluations],
    )


def run_batch_internal(req: BatchRunRequest) -> BatchAnalysisResult:
    """Execute generator and pipeline for a batch request."""
    df_batch = generate_formation_batch(
        batch_id=req.batch_id,
        num_cells=req.num_cells,
        micro_short_rate=req.micro_short_rate,
        high_dcir_rate=req.high_dcir_rate,
        low_capacity_rate=req.low_capacity_rate,
    )
    return process_batch(df_batch)


def get_or_create_active_batch() -> BatchAnalysisResult:
    """Retrieve or initialize the active batch analysis result."""
    if state.active_batch is None:
        state.active_batch = run_batch_internal(BatchRunRequest())
    return state.active_batch


def run_batch(req: BatchRunRequest) -> BatchSummaryResponse:
    """Run a new batch analysis and update active batch."""
    state.active_batch = run_batch_internal(req)
    return build_batch_summary(state.active_batch)


def load_novonix_batch() -> BatchSummaryResponse:
    """Parse and process the 114MB SINTEF Novonix UHPC cycler dataset into the active batch."""
    novonix_file = find_dataset_file("SINTEF__SLPBA842124HV-06__20241011__DCIR__0p1C__25degC__Novonix.csv")

    if not novonix_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Novonix dataset file not found on disk.",
        )

    parser = NovonixParser()
    df_cell9 = parser.parse(novonix_file, cell_id="SINTEF_NOVONIX_CH09", channel_id=9)
    df_cell9 = df_cell9.with_columns(pl.lit("BATCH_SINTEF_2024").alias("batch_id"))

    sim_batch = generate_formation_batch(
        batch_id="BATCH_SINTEF_2024",
        num_cells=24,
        micro_short_rate=0.08,
        high_dcir_rate=0.08,
        low_capacity_rate=0.08,
    )
    df_other = sim_batch.filter(pl.col("channel_id") != 9)
    df_combined = pl.concat([df_other, df_cell9], how="diagonal")

    state.active_batch = process_batch(df_combined)
    return build_batch_summary(state.active_batch)


def load_neware_batch() -> BatchSummaryResponse:
    """Parse and process the SINTEF Neware cycler dataset into the active batch inspection cabinet."""
    neware_file = find_dataset_file("SINTEF__SLPBA842124HV__2024-10-23__Rate_25degC__Neware__Time_Bug.csv")

    if not neware_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Neware dataset file not found on disk.",
        )

    parser = NewareParser()
    df_cell1 = parser.parse(neware_file, cell_id="SINTEF_NEWARE_CH01", channel_id=1)
    df_cell1 = df_cell1.with_columns(pl.lit("BATCH_SINTEF_NEWARE").alias("batch_id"))

    sim_batch = generate_formation_batch(
        batch_id="BATCH_SINTEF_NEWARE",
        num_cells=24,
        micro_short_rate=0.08,
        high_dcir_rate=0.08,
        low_capacity_rate=0.08,
    )
    df_other = sim_batch.filter(pl.col("channel_id") != 1)
    df_combined = pl.concat([df_other, df_cell1], how="diagonal")

    state.active_batch = process_batch(df_combined)
    return build_batch_summary(state.active_batch)


def get_cell_detail(cell_id: str) -> CellDetailResponse:
    """Retrieve high-fidelity telemetry, V-Q curves, and dQ/dV phase peaks for an individual cell."""
    batch = get_or_create_active_batch()

    eval_match = next((e for e in batch.evaluations if e.cell_id == cell_id), None)
    if not eval_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cell ID '{cell_id}' not found in active batch.",
        )

    df_cell = batch.raw_df.filter(pl.col("cell_id") == cell_id)
    if df_cell.is_empty():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Telemetry data for cell '{cell_id}' is empty.",
        )

    # Subsample if dataset is large to maintain ~1000 data points for snappy interactive charts
    total_rows = df_cell.height
    step_stride = max(1, total_rows // 800)
    df_sampled = df_cell.gather(range(0, total_rows, step_stride))

    t_mins = (df_sampled["timestamp_s"] / 60.0).to_list()
    v_vals = df_sampled["voltage_v"].to_list()
    i_vals = df_sampled["current_a"].to_list()
    s_types = df_sampled["step_type"].to_list()
    c_vals = df_sampled["capacity_ah"].to_list()

    telemetry: List[TelemetryPoint] = [
        TelemetryPoint(
            timestamp_min=round(t, 2),
            voltage_v=round(v, 4),
            current_a=round(i, 2),
            step_type=s,
            capacity_ah=round(c, 4),
        )
        for t, v, i, s, c in zip(t_mins, v_vals, i_vals, s_types, c_vals)
    ]

    # Voltage vs. Capacity curve
    df_chg_dchg = df_cell.filter(pl.col("step_type").is_in(["CC_CHG", "CV_CHG", "CC_DCHG"]))
    stride_vq = max(1, df_chg_dchg.height // 500)
    df_vq_sampled = df_chg_dchg.gather(range(0, df_chg_dchg.height, stride_vq))

    vq_curve: List[VQCurvePoint] = [
        VQCurvePoint(
            capacity_ah=round(c, 4),
            voltage_v=round(v, 4),
            step_type=s,
        )
        for c, v, s in zip(
            df_vq_sampled["capacity_ah"].to_list(),
            df_vq_sampled["voltage_v"].to_list(),
            df_vq_sampled["step_type"].to_list(),
        )
    ]

    # dQ/dV phase curve
    dqdv_curve: Optional[DQDVPhaseCurve] = None
    if cell_id in batch.dqdv_curves:
        v_grid, dqdv_smooth, peaks = batch.dqdv_curves[cell_id]
        # Decimate v_grid to ~300 points for smooth rendering
        stride_dq = max(1, len(v_grid) // 300)
        peak_schemas = [
            DQDVPeakSchema(
                peak_voltage_v=round(p.peak_voltage_v, 4),
                peak_height=round(p.peak_height, 4),
                prominence=round(p.prominence, 4),
                area=round(p.area, 4),
                phase_transition=p.phase_transition,
            )
            for p in peaks
        ]
        dqdv_curve = DQDVPhaseCurve(
            v_grid=[round(float(val), 4) for val in v_grid[::stride_dq]],
            dqdv_smooth=[round(float(val), 4) for val in dqdv_smooth[::stride_dq]],
            peaks=peak_schemas,
        )

    return CellDetailResponse(
        evaluation=format_cell_evaluation(eval_match),
        telemetry=telemetry,
        vq_curve=vq_curve,
        dqdv_curve=dqdv_curve,
    )


def get_screening_scatter() -> ScreeningScatterResponse:
    """Retrieve K-value vs DCIR defect screening coordinates for all cells in batch."""
    batch = get_or_create_active_batch()

    scatter_cells: List[ScreeningScatterPoint] = []
    for e in batch.evaluations:
        scatter_cells.append(
            ScreeningScatterPoint(
                cell_id=e.cell_id,
                channel_id=e.channel_id,
                k_value_mv_day=round(e.k_value_mv_day, 4),
                dcir_mohm=round(e.dcir_mohm, 2),
                actual_capacity_ah=round(e.actual_capacity_ah, 4),
                grade=CellGradeEnum(e.grade.value),
                is_micro_short=e.k_value_mv_day >= 0.50,
                is_high_dcir=e.dcir_mohm > 35.0,
            )
        )

    return ScreeningScatterResponse(
        k_threshold_mv_day=0.50,
        dcir_threshold_mohm=35.0,
        cells=scatter_cells,
    )


def get_spc_summary() -> SPCSummaryResponse:
    """Retrieve Shewhart X-bar control chart parameters and channel points."""
    batch = get_or_create_active_batch()
    spc = batch.spc_capacity

    data_points: List[SPCPositionPoint] = [
        SPCPositionPoint(
            channel_id=e.channel_id,
            cell_id=e.cell_id,
            capacity_ah=round(e.actual_capacity_ah, 4),
            subgroup_id=(idx // 4) + 1,
        )
        for idx, e in enumerate(batch.evaluations)
    ]

    return SPCSummaryResponse(
        metric_name=spc.metric_name,
        mean=round(spc.mean, 4),
        std_dev=round(spc.std_dev, 4),
        usl=round(spc.usl, 4),
        lsl=round(spc.lsl, 4),
        ucl=round(spc.ucl, 4),
        lcl=round(spc.lcl, 4),
        cp=round(spc.cp, 2),
        cpk=round(spc.cpk, 2),
        pp=round(spc.pp, 2),
        ppk=round(spc.ppk, 2),
        is_capable=spc.is_capable,
        data_points=data_points,
    )
