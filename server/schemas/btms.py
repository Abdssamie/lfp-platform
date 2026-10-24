"""Pydantic schemas for Battery Thermal Management System (BTMS) simulation."""

from typing import List
from pydantic import BaseModel, Field


class BTMSRequest(BaseModel):
    c_rate: float = Field(default=1.0, ge=0.1, le=10.0, description="Charge C-rate multiplier (e.g. 1.0 for 1C)")
    ambient_temp_c: float = Field(default=25.0, ge=-20.0, le=60.0, description="Ambient and coolant inlet temperature in Celsius")
    coolant_flow_lpm: float = Field(default=4.0, ge=0.1, le=30.0, description="Coolant volumetric flow rate in Liters/minute")
    cell_capacity_ah: float = Field(default=50.0, ge=1.0, le=300.0, description="Nominal cell capacity in Ah")
    duration_s: float = Field(default=1200.0, ge=60.0, le=7200.0, description="Simulation duration in seconds")


class BTMSSimulationPoint(BaseModel):
    time_s: float
    soc: float
    t_core_c: float
    t_surf_c: float
    delta_t_c: float
    q_joule_w: float
    q_entropic_w: float
    q_total_w: float


class BTMSResponse(BaseModel):
    params: BTMSRequest
    max_core_temp_c: float
    max_surface_temp_c: float
    max_thermal_gradient_c: float
    is_compliant: bool
    summary_verdict: str
    time_series: List[BTMSSimulationPoint]
