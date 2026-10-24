"""Data models and type definitions for LFP battery formation and aging analytics."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class StepType(str, Enum):
    CC_CHG = "CC_CHG"          # Constant Current Charge
    CV_CHG = "CV_CHG"          # Constant Voltage Saturation
    REST = "REST"              # Rest / Open Circuit
    CC_DCHG = "CC_DCHG"        # Constant Current Discharge
    PULSE_DCHG = "PULSE_DCHG"  # Current pulse for DCIR


class CellGrade(str, Enum):
    GRADE_A = "Grade A"        # EV Pack ready (IATF 16949 compliant)
    GRADE_B_ESS = "Grade B"    # Stationary Energy Storage System
    SCRAP = "Scrap"            # Quarantined / Micro-short hazard


class CycleMetrics(BaseModel):
    cycle_index: int
    charge_capacity_ah: float
    discharge_capacity_ah: float
    coulombic_efficiency: float
    energy_efficiency: float
    cc_charge_time_s: float
    cv_charge_time_s: float


class DQDVPeak(BaseModel):
    peak_voltage_v: float
    peak_height: float
    prominence: float
    area: float
    phase_transition: str = "FePO4 <-> LiFePO4"


class ScreeningResult(BaseModel):
    k_value_mv_day: float          # Self-discharge rate dV/dt (mV/day)
    k_value_r_squared: float       # Linear regression goodness of fit
    is_micro_short: bool           # True if K-value exceeds safety threshold
    dcir_mohm: float               # Direct Current Internal Resistance in mOhm
    dcir_pulse_current_a: float


class CellEvaluation(BaseModel):
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
    grade: CellGrade
    failure_reasons: List[str] = Field(default_factory=list)


class SPCMetricSummary(BaseModel):
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
    is_capable: bool  # Cpk >= 1.33
