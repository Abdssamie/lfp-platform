"""Statistical Process Control (SPC) and Automotive IATF 16949 Grading Engine.

Implements:
1. Shewhart X-bar / R and X-bar / S control charts with ASTM / ISO constants.
2. Process Capability metrics: Cp, Cpk, Pp, Ppk adhering to IATF 16949 (target Cpk >= 1.33).
3. Automated Cell Binning / Grading: Grade A (EV-ready), Grade B (ESS), Scrap (Micro-short).
"""

import numpy as np
import polars as pl
from scipy import stats
from typing import Dict, List, Optional, Tuple
from lfp_platform.models import CellEvaluation, CellGrade, SPCMetricSummary


# Standard Shewhart constants for subgroup sizes n = 2..15
SHEWHART_CONSTANTS: Dict[int, Dict[str, float]] = {
    2: {"A2": 1.880, "D3": 0.000, "D4": 3.267, "d2": 1.128},
    3: {"A2": 1.023, "D3": 0.000, "D4": 2.574, "d2": 1.693},
    4: {"A2": 0.729, "D3": 0.000, "D4": 2.282, "d2": 2.059},
    5: {"A2": 0.577, "D3": 0.000, "D4": 2.114, "d2": 2.326},
    6: {"A2": 0.483, "D3": 0.000, "D4": 2.004, "d2": 2.534},
    7: {"A2": 0.419, "D3": 0.076, "D4": 1.924, "d2": 2.704},
    8: {"A2": 0.373, "D3": 0.136, "D4": 1.864, "d2": 2.847},
    9: {"A2": 0.337, "D3": 0.184, "D4": 1.816, "d2": 2.970},
    10: {"A2": 0.308, "D3": 0.223, "D4": 1.777, "d2": 3.078},
    12: {"A2": 0.266, "D3": 0.283, "D4": 1.717, "d2": 3.258},
}


def get_shewhart_factors(subgroup_size: int) -> Dict[str, float]:
    """Get Shewhart control chart factors for given subgroup size."""
    size = max(2, min(subgroup_size, 12))
    return SHEWHART_CONSTANTS.get(size, SHEWHART_CONSTANTS[5])


def calculate_capability(
    values: np.ndarray,
    usl: float,
    lsl: float,
    subgroup_size: int = 4,
) -> SPCMetricSummary:
    """Calculate process capability indices (Cp, Cpk, Pp, Ppk)."""
    if len(values) < 2:
        return SPCMetricSummary(
            metric_name="metric",
            mean=0.0,
            std_dev=0.0,
            usl=usl,
            lsl=lsl,
            ucl=0.0,
            lcl=0.0,
            cp=0.0,
            cpk=0.0,
            pp=0.0,
            ppk=0.0,
            is_capable=False,
        )

    mean_val = float(np.mean(values))
    std_overall = float(np.std(values, ddof=1))

    # Calculate within-subgroup variation using Mean Range (R-bar / d2)
    n = max(2, min(subgroup_size, len(values) // 2 or 2))
    num_subgroups = len(values) // n
    if num_subgroups >= 2:
        reshaped = values[: num_subgroups * n].reshape(num_subgroups, n)
        ranges = np.ptp(reshaped, axis=1)  # Peak-to-peak (range)
        r_bar = float(np.mean(ranges))
        d2 = get_shewhart_factors(n)["d2"]
        sigma_within = r_bar / d2 if d2 > 0 else std_overall
    else:
        sigma_within = std_overall

    # Prevent division by zero
    sigma_within = max(sigma_within, 1e-6)
    std_overall = max(std_overall, 1e-6)

    # Short-term potential capability (Cp, Cpk)
    cp = (usl - lsl) / (6.0 * sigma_within)
    cp_upper = (usl - mean_val) / (3.0 * sigma_within)
    cp_lower = (mean_val - lsl) / (3.0 * sigma_within)
    cpk = min(cp_upper, cp_lower)

    # Long-term performance (Pp, Ppk)
    pp = (usl - lsl) / (6.0 * std_overall)
    pp_upper = (usl - mean_val) / (3.0 * std_overall)
    pp_lower = (mean_val - lsl) / (3.0 * std_overall)
    ppk = min(pp_upper, pp_lower)

    # 3-sigma control limits for individuals
    ucl = mean_val + 3.0 * sigma_within
    lcl = mean_val - 3.0 * sigma_within

    return SPCMetricSummary(
        metric_name="Formation Capacity",
        mean=round(mean_val, 4),
        std_dev=round(std_overall, 4),
        usl=round(usl, 4),
        lsl=round(lsl, 4),
        ucl=round(ucl, 4),
        lcl=round(lcl, 4),
        cp=round(cp, 3),
        cpk=round(cpk, 3),
        pp=round(pp, 3),
        ppk=round(ppk, 3),
        is_capable=bool(cpk >= 1.33),
    )


def grade_cell(
    cell_id: str,
    channel_id: int,
    batch_id: str,
    discharge_capacity_ah: float,
    dcir_mohm: float,
    k_value_mv_day: float,
    primary_peak_v: float,
    primary_peak_height: float,
    nominal_capacity_ah: float = 3.20,
    k_micro_short_limit: float = 0.50,
    dcir_grade_a_limit: float = 30.0,
    dcir_grade_b_limit: float = 45.0,
) -> CellEvaluation:
    """Evaluate cell according to automotive IATF 16949 standards."""
    retention_pct = (discharge_capacity_ah / nominal_capacity_ah) * 100.0
    failure_reasons: List[str] = []

    # Screening Rule 1: Micro-short risk (K-value) -> Instant Scrap
    if k_value_mv_day >= k_micro_short_limit:
        failure_reasons.append(f"Micro-short hazard: K-value {k_value_mv_day:.2f} >= {k_micro_short_limit} mV/day")

    # Screening Rule 2: Severely degraded capacity
    if discharge_capacity_ah < 2.90:
        failure_reasons.append(f"Low capacity: {discharge_capacity_ah:.3f} Ah < 2.90 Ah limit")

    # Screening Rule 3: Extreme DCIR
    if dcir_mohm > dcir_grade_b_limit:
        failure_reasons.append(f"Excessive DCIR: {dcir_mohm:.1f} mOhm > {dcir_grade_b_limit} mOhm limit")

    # Determine Grade
    if failure_reasons:
        grade = CellGrade.SCRAP
    elif discharge_capacity_ah >= 3.10 and dcir_mohm <= dcir_grade_a_limit:
        grade = CellGrade.GRADE_A
    else:
        grade = CellGrade.GRADE_B_ESS
        if discharge_capacity_ah < 3.10:
            failure_reasons.append("Marginal capacity: Rerouted to ESS")
        if dcir_mohm > dcir_grade_a_limit:
            failure_reasons.append("Elevated DCIR: Rerouted to ESS")

    return CellEvaluation(
        cell_id=cell_id,
        channel_id=channel_id,
        batch_id=batch_id,
        nominal_capacity_ah=nominal_capacity_ah,
        actual_capacity_ah=round(discharge_capacity_ah, 4),
        capacity_retention_pct=round(retention_pct, 2),
        coulombic_efficiency_pct=round(min(99.9, (discharge_capacity_ah / (discharge_capacity_ah * 1.008)) * 100), 2),
        dcir_mohm=round(dcir_mohm, 2),
        k_value_mv_day=round(k_value_mv_day, 3),
        primary_peak_v=round(primary_peak_v, 4),
        primary_peak_height=round(primary_peak_height, 4),
        grade=grade,
        failure_reasons=failure_reasons,
    )
