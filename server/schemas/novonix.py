"""Novonix UHPC cycler dataset Pydantic schemas."""

from typing import List, Optional
from pydantic import BaseModel


class NovonixMetadataSchema(BaseModel):
    cell_id: str
    channel_name: str
    protocol: str
    total_runtime_h: float
    total_rows: int
    total_steps: int
    measured_capacity_ah: float
    nominal_capacity_ah: float
    min_voltage_v: float
    max_voltage_v: float
    mean_dcir_mohm: float
    mean_temp_c: float


class NovonixTelemetryPoint(BaseModel):
    runtime_h: float
    voltage_v: float
    current_a: float
    capacity_ah: float
    temp_c: float
    step_number: int


class NovonixVQPoint(BaseModel):
    capacity_ah: float
    voltage_v: float
    step_type: str


class NovonixDQDVResponse(BaseModel):
    v_grid: List[float]
    dqdv_smooth: List[float]
    peak_v: float
    peak_height: float


class NovonixDCIRPulse(BaseModel):
    step: int
    type: str
    current_a: float
    v_mean: float
    v_start: float
    v_end: float
    delta_v: float
    duration_s: float
    dcir_mohm: float
    temp_c: float


class NovonixStepSummary(BaseModel):
    step_number: int
    step_type: str
    start_time_h: float
    duration_s: float
    avg_current_a: float
    min_v: float
    max_v: float
    dcir_mohm: Optional[float] = None
    point_count: int


class NovonixDatasetResponse(BaseModel):
    metadata: NovonixMetadataSchema
    telemetry: List[NovonixTelemetryPoint]
    vq_curve: List[NovonixVQPoint]
    dqdv_curve: NovonixDQDVResponse
    dcir_pulses: List[NovonixDCIRPulse]
    steps: List[NovonixStepSummary]
