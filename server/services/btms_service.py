"""BTMS simulation service and caching."""

from lfp_platform.analytics.btms import simulate_btms_cooling
from server import state
from server.schemas import BTMSRequest, BTMSResponse, BTMSSimulationPoint


def run_btms_simulation(req: BTMSRequest) -> BTMSResponse:
    """Run BTMS physics simulation and return validated response schema."""
    is_default = (
        req.c_rate == 1.0
        and req.ambient_temp_c == 25.0
        and req.coolant_flow_lpm == 4.0
        and req.cell_capacity_ah == 50.0
        and req.duration_s == 1200.0
    )
    if is_default and state.btms_cache is not None:
        return state.btms_cache

    res = simulate_btms_cooling(
        c_rate=req.c_rate,
        ambient_temp_c=req.ambient_temp_c,
        coolant_flow_lpm=req.coolant_flow_lpm,
        duration_s=req.duration_s,
        cell_capacity_ah=req.cell_capacity_ah,
    )

    points = [BTMSSimulationPoint(**pt) for pt in res["time_series"]]
    response = BTMSResponse(
        params=req,
        max_core_temp_c=res["max_core_temp_c"],
        max_surface_temp_c=res["max_surface_temp_c"],
        max_thermal_gradient_c=res["max_thermal_gradient_c"],
        is_compliant=res["is_compliant"],
        summary_verdict=res["summary_verdict"],
        time_series=points,
    )

    if is_default:
        state.btms_cache = response

    return response


def prewarm_btms_cache() -> BTMSResponse:
    """Pre-warm default BTMS simulation for zero-latency initial response."""
    default_req = BTMSRequest()
    res = run_btms_simulation(default_req)
    state.btms_cache = res
    return res
