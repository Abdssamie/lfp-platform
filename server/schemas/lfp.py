"""LG Chem LFP cell dataset Pydantic schemas."""

from typing import List
from pydantic import BaseModel


class LfpMetadataSchema(BaseModel):
    cell_id: str
    manufacturer: str
    positive_electrode: str
    negative_electrode: str
    nominal_capacity_ah: float
    measured_capacity_ah: float
    nominal_voltage_v: float
    min_voltage_v: float
    max_voltage_v: float
    total_runtime_h: float
    total_rows: int
    total_steps: int
    cell_weight_g: float
    plateau_fraction_pct: float


class LfpTelemetryPoint(BaseModel):
    runtime_h: float
    voltage_v: float
    current_a: float
    capacity_ah: float
    soc: float
    step_type: str
    c_rate: str


class LfpVQPoint(BaseModel):
    capacity_ah: float
    voltage_v: float
    rate_label: str
    step_type: str


class LfpDQDVResponse(BaseModel):
    v_grid: List[float]
    charge_dqdv: List[float]
    discharge_dqdv: List[float]
    charge_peak_v: float
    charge_peak_height: float
    discharge_peak_v: float
    discharge_peak_height: float
    delta_v_hysteresis_mv: float


class LfpStepSummary(BaseModel):
    step_index: int
    regime: str = "Constant Current"
    step_name: str
    c_rate: str
    step_type: str
    duration_s: float
    duration_h: float = 0.0
    current_a: float
    capacity_ah: float
    energy_wh: float
    min_v: float
    max_v: float
    point_count: int


class LfpGittPoint(BaseModel):
    pulse_index: int
    soc: float
    voltage_pulse_end: float
    ocv_relaxed: float
    current_a: float
    r_internal_mohm: float
    d_li_cm2_s: float


class LfpGittCurvePoint(BaseModel):
    runtime_h: float
    voltage_v: float
    current_a: float
    soc: float


class LfpDriveProfilePoint(BaseModel):
    time_s: float
    time_h: float
    voltage_v: float
    current_a: float
    net_ah: float
    soc: float


class LfpDatasetResponse(BaseModel):
    metadata: LfpMetadataSchema
    telemetry: List[LfpTelemetryPoint]
    vq_curves: List[LfpVQPoint]
    dqdv_curve: LfpDQDVResponse
    steps: List[LfpStepSummary]
    gitt_pulses: List[LfpGittPoint] = []
    gitt_timeline: List[LfpGittCurvePoint] = []
    drive_profile: List[LfpDriveProfilePoint] = []
