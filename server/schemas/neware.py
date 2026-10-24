"""Neware BTS cycler dataset Pydantic schemas."""

from typing import List
from pydantic import BaseModel


class NewareMetadataSchema(BaseModel):
    cell_id: str
    cycler: str
    test_type: str
    total_runtime_h: float
    total_rows: int
    total_steps: int
    nominal_capacity_ah: float
    measured_capacity_ah: float
    min_voltage_v: float
    max_voltage_v: float
    max_discharge_current_a: float
    mean_temp_c: float
    time_bug_resolved: bool
    quarantine_events_count: int


class NewareTelemetryPoint(BaseModel):
    runtime_h: float
    voltage_v: float
    current_a: float
    capacity_ah: float
    temp_c: float
    step_index: int
    step_type: str


class NewareRateCurvePoint(BaseModel):
    capacity_ah: float
    voltage_v: float
    rate_label: str
    c_rate: float


class NewareDQDVResponse(BaseModel):
    v_grid: List[float]
    dqdv_smooth: List[float]
    peak_v: float
    peak_height: float


class NewareRateRetentionPoint(BaseModel):
    rate_c: float
    rate_label: str
    current_a: float
    capacity_ah: float
    retention_pct: float
    duration_min: float
    energy_wh: float


class NewareStepSummary(BaseModel):
    step_index: int
    step_type: str
    start_time_h: float
    duration_s: float
    avg_current_a: float
    capacity_ah: float
    min_v: float
    max_v: float
    point_count: int


class NewareDatasetResponse(BaseModel):
    metadata: NewareMetadataSchema
    telemetry: List[NewareTelemetryPoint]
    rate_curves: List[NewareRateCurvePoint]
    dqdv_curve: NewareDQDVResponse
    rate_retention: List[NewareRateRetentionPoint]
    steps: List[NewareStepSummary]
