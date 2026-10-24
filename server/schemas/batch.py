"""Batch, SPC, and defect screening Pydantic schemas."""

from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class CellGradeEnum(str, Enum):
    GRADE_A = "Grade A"
    GRADE_B_ESS = "Grade B"
    SCRAP = "Scrap"


class BatchRunRequest(BaseModel):
    batch_id: str = Field(default="BATCH_202610A", description="Identifier for the cycler lot")
    num_cells: int = Field(default=24, ge=4, le=96, description="Number of channels/cells to process")
    micro_short_rate: float = Field(default=0.08, ge=0.0, le=0.5, description="Probability of micro-short hazard")
    high_dcir_rate: float = Field(default=0.08, ge=0.0, le=0.5, description="Probability of elevated DCIR")
    low_capacity_rate: float = Field(default=0.08, ge=0.0, le=0.5, description="Probability of low capacity")


class CellEvaluationSchema(BaseModel):
    cell_id: str
    channel_id: int
    batch_id: str
    nominal_capacity_ah: float = 3.20
    actual_capacity_ah: float
    capacity_retention_pct: float
    coulombic_efficiency_pct: float
    dcir_mohm: float
    k_value_mv_day: float
    primary_peak_v: float
    primary_peak_height: float
    grade: CellGradeEnum
    failure_reasons: List[str] = Field(default_factory=list)


class SPCMetricSummarySchema(BaseModel):
    metric_name: str
    mean: float
    std_dev: float
    usl: float
    lsl: float
    ucl: float
    lcl: float
    cp: float
    cpk: float
    pp: float
    ppk: float
    is_capable: bool


class MicroShortAlertSchema(BaseModel):
    has_hazard: bool
    quarantined_channels: List[int] = Field(default_factory=list)
    alert_message: str


class BatchSummaryResponse(BaseModel):
    batch_id: str
    total_cells: int
    grade_a_count: int
    grade_b_count: int
    scrap_count: int
    yield_pct: float
    spc_capacity: SPCMetricSummarySchema
    micro_short_alert: MicroShortAlertSchema
    evaluations: List[CellEvaluationSchema]


class ScreeningScatterPoint(BaseModel):
    cell_id: str
    channel_id: int
    k_value_mv_day: float
    dcir_mohm: float
    actual_capacity_ah: float
    grade: CellGradeEnum
    is_micro_short: bool
    is_high_dcir: bool


class ScreeningScatterResponse(BaseModel):
    k_threshold_mv_day: float = 0.50
    dcir_threshold_mohm: float = 35.0
    cells: List[ScreeningScatterPoint]


class SPCPositionPoint(BaseModel):
    channel_id: int
    cell_id: str
    capacity_ah: float
    subgroup_id: int


class SPCSummaryResponse(BaseModel):
    metric_name: str
    mean: float
    std_dev: float
    usl: float
    lsl: float
    ucl: float
    lcl: float
    cp: float
    cpk: float
    pp: float
    ppk: float
    is_capable: bool
    data_points: List[SPCPositionPoint]
