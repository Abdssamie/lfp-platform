"""High-throughput analytics pipeline for multi-channel battery cycler logs.

Coordinates:
1. Cycler step partitioning (CC_CHG, CV_CHG, REST, PULSE, CC_DCHG)
2. Differential Capacity Analysis (dQ/dV with Savitzky-Golay)
3. Defect Screening (K-value self-discharge & DCIR extraction)
4. SPC Capability evaluation and cell grading
"""

import polars as pl
import numpy as np
from typing import Dict, List, Tuple
from lfp_platform.models import CellEvaluation, CellGrade, SPCMetricSummary, DQDVPeak
from lfp_platform.analytics.dqdv import compute_dqdv
from lfp_platform.analytics.screening import screen_cell
from lfp_platform.analytics.spc import calculate_capability, grade_cell


class BatchAnalysisResult:
    """Container for batch analysis outputs."""
    def __init__(
        self,
        batch_id: str,
        evaluations: List[CellEvaluation],
        spc_capacity: SPCMetricSummary,
        dqdv_curves: Dict[str, Tuple[np.ndarray, np.ndarray, List[DQDVPeak]]],
        raw_df: pl.DataFrame,
    ):
        self.batch_id = batch_id
        self.evaluations = evaluations
        self.spc_capacity = spc_capacity
        self.dqdv_curves = dqdv_curves
        self.raw_df = raw_df

    @property
    def total_cells(self) -> int:
        return len(self.evaluations)

    @property
    def grade_a_count(self) -> int:
        return sum(1 for e in self.evaluations if e.grade == CellGrade.GRADE_A)

    @property
    def grade_b_count(self) -> int:
        return sum(1 for e in self.evaluations if e.grade == CellGrade.GRADE_B_ESS)

    @property
    def scrap_count(self) -> int:
        return sum(1 for e in self.evaluations if e.grade == CellGrade.SCRAP)

    @property
    def yield_pct(self) -> float:
        return (self.grade_a_count / max(1, self.total_cells)) * 100.0


def process_batch(df_batch: pl.DataFrame) -> BatchAnalysisResult:
    """Execute end-to-end QC and analytics pipeline on a cycler batch."""
    batch_ids = df_batch["batch_id"].unique().to_list()
    batch_id = str(batch_ids[0]) if batch_ids else "BATCH_DEFAULT"

    evaluations: List[CellEvaluation] = []
    dqdv_curves: Dict[str, Tuple[np.ndarray, np.ndarray, List[DQDVPeak]]] = {}
    capacities: List[float] = []

    # Process each cell in the batch
    cell_ids = df_batch["cell_id"].unique().sort().to_list()

    for c_id in cell_ids:
        df_cell = df_batch.filter(pl.col("cell_id") == c_id)
        channel_id = int(df_cell["channel_id"][0]) if "channel_id" in df_cell.columns else 1

        # 1. Defect Screening (K-value & DCIR)
        screening = screen_cell(df_cell)

        # 2. Differential Capacity Analysis (dQ/dV on CC_CHG)
        df_chg = df_cell.filter(pl.col("step_type") == "CC_CHG")
        v_grid, dqdv_smooth, peaks = compute_dqdv(df_chg)
        dqdv_curves[c_id] = (v_grid, dqdv_smooth, peaks)

        primary_peak_v = peaks[0].peak_voltage_v if peaks else 3.42
        primary_peak_h = peaks[0].peak_height if peaks else 1.0

        # 3. Discharge Capacity
        df_dchg = df_cell.filter(pl.col("step_type") == "CC_DCHG")
        if not df_dchg.is_empty():
            actual_cap = float(df_dchg["capacity_ah"].max() or 3.20)
        else:
            actual_cap = float(df_cell["capacity_ah"].max() or 3.20)

        capacities.append(actual_cap)

        # 4. Automotive IATF 16949 Grading
        cell_eval = grade_cell(
            cell_id=c_id,
            channel_id=channel_id,
            batch_id=batch_id,
            discharge_capacity_ah=actual_cap,
            dcir_mohm=screening.dcir_mohm,
            k_value_mv_day=screening.k_value_mv_day,
            primary_peak_v=primary_peak_v,
            primary_peak_height=primary_peak_h,
        )
        evaluations.append(cell_eval)

    # 5. Batch-wide SPC Capability (USL = 3.35 Ah, LSL = 3.05 Ah)
    spc_cap = calculate_capability(
        values=np.array(capacities),
        usl=3.35,
        lsl=3.05,
        subgroup_size=4,
    )

    return BatchAnalysisResult(
        batch_id=batch_id,
        evaluations=evaluations,
        spc_capacity=spc_cap,
        dqdv_curves=dqdv_curves,
        raw_df=df_batch,
    )
