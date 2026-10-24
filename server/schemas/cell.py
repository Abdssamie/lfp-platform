"""Cell telemetry, curves, and detail Pydantic schemas."""

from typing import List, Optional
from pydantic import BaseModel
from server.schemas.batch import CellEvaluationSchema


class TelemetryPoint(BaseModel):
    timestamp_min: float
    voltage_v: float
    current_a: float
    step_type: str
    capacity_ah: float


class VQCurvePoint(BaseModel):
    capacity_ah: float
    voltage_v: float
    step_type: str


class DQDVPeakSchema(BaseModel):
    peak_voltage_v: float
    peak_height: float
    prominence: float
    area: float
    phase_transition: str = "FePO4 <-> LiFePO4"


class DQDVPhaseCurve(BaseModel):
    v_grid: List[float]
    dqdv_smooth: List[float]
    peaks: List[DQDVPeakSchema]


class CellDetailResponse(BaseModel):
    evaluation: CellEvaluationSchema
    telemetry: List[TelemetryPoint]
    vq_curve: List[VQCurvePoint]
    dqdv_curve: Optional[DQDVPhaseCurve] = None
