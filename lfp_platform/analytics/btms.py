"""Battery Thermal Management System (BTMS) physics simulation module.

Resolves the Bernardi Heat Generation Equation (1985) coupled with a 1D two-state
thermal model (Core and Surface) and Dittus-Boelter turbulent liquid cooling.
Evaluates compliance with automotive IATF 16949 / ISO 26262 cell thermal limits.
"""

from typing import Any, Dict, List
import numpy as np
from scipy.integrate import solve_ivp


class BTMSSimulationResult(dict):
    """Dictionary subclass supporting attribute-style access for BTMS results."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError:
            raise AttributeError(f"'BTMSSimulationResult' object has no attribute '{name}'")

    def __setattr__(self, name: str, value: Any) -> None:
        self[name] = value


def compute_lfp_entropic_coefficient(soc: float) -> float:
    """Compute LiFePO4 entropic coefficient dU_ocv/dT in V/K as a function of SOC.

    Transitions between endothermic and exothermic behavior across the two-phase
    plateau (-0.08 mV/K to +0.06 mV/K).
    """
    s = float(np.clip(soc, 0.0, 1.0))
    # Polynomial profile in mV/K:
    # At SOC 0.0: -0.08 mV/K (exothermic during charge)
    # At SOC 0.2: -0.015 mV/K
    # At SOC 0.5: +0.041 mV/K (endothermic phase transition)
    # At SOC 0.7: +0.060 mV/K
    # At SOC 1.0: -0.020 mV/K
    mv_per_k = -0.08 + 0.62 * s - 0.95 * (s ** 2) + 0.39 * (s ** 3)
    return mv_per_k * 1e-3


def simulate_btms_cooling(
    c_rate: float,
    ambient_temp_c: float,
    coolant_flow_lpm: float,
    duration_s: float = 1200.0,
    cell_capacity_ah: float = 50.0,
) -> BTMSSimulationResult:
    """Simulate 1D two-state transient thermal response of a 50Ah LFP cell under liquid cooling.

    Parameters:
        c_rate: Charge C-rate multiplier (e.g. 1.0 for 1C = 50A, 3.0 for 3C = 150A).
        ambient_temp_c: Ambient and coolant inlet temperature in Celsius.
        coolant_flow_lpm: Volumetric flow rate of 50/50 water-ethylene glycol in L/min.
        duration_s: Total charge duration to simulate in seconds (default 1200s).
        cell_capacity_ah: Cell nominal capacity in Ah (default 50Ah).

    Returns:
        BTMSSimulationResult containing time series and automotive compliance metrics.
    """
    current_a = float(c_rate * cell_capacity_ah)
    flow_lpm = max(0.1, float(coolant_flow_lpm))
    t_coolant_c = float(ambient_temp_c)

    # 1. Thermal mass: Prismatic LFP 50Ah (m ≈ 1.15 kg, Cp ≈ 1100 J/(kg·K))
    cell_mass_kg = 1.15
    specific_heat_j_kgk = 1100.0
    c_total = cell_mass_kg * specific_heat_j_kgk  # 1265.0 J/K
    c_core = 0.65 * c_total  # Core thermal capacitance: ~822 J/K
    c_surf = 0.35 * c_total  # Surface thermal capacitance: ~443 J/K

    # 2. Convective cooling: Dittus-Boelter correlation (Nu ~ Re^0.8) for 50/50 WEG
    v_ref_lpm = 4.0
    h_ref_w_m2k = 800.0
    a_plate_m2 = 0.03
    h_conv = h_ref_w_m2k * ((flow_lpm / v_ref_lpm) ** 0.8)
    r_conv = 1.0 / max(1.0, h_conv * a_plate_m2)

    # 3. Conduction & boundary layer thermal resistance (Core to cooling interface)
    r_core_internal = 0.07
    r_interface_base = 0.06
    r_cond = r_core_internal + r_interface_base / ((flow_lpm / v_ref_lpm) ** 0.4)

    # 4. ODE state system for solve_ivp
    def btms_ode(t: float, y: List[float]) -> List[float]:
        t_core, t_surf = y
        soc = min(1.0, (current_a * t) / (cell_capacity_ah * 3600.0))
        t_core_k = t_core + 273.15

        # Arrhenius internal resistance model (R_ref = 1.2 mΩ at 25°C)
        ea_over_r = 1600.0
        r_soc = 1.0 + 0.25 * ((soc - 0.5) ** 2)
        r_temp = np.exp(ea_over_r * (1.0 / t_core_k - 1.0 / 298.15))
        r_int = 0.0012 * r_soc * r_temp

        # Bernardi heat generation: Q_gen = Q_joule + Q_entropic
        q_joule = (current_a ** 2) * r_int
        q_entropic = - current_a * t_core_k * compute_lfp_entropic_coefficient(soc)
        q_gen = max(0.0, q_joule + q_entropic)

        # Coupled 1D two-state balance
        dt_core_dt = (q_gen - (t_core - t_surf) / r_cond) / c_core
        dt_surf_dt = ((t_core - t_surf) / r_cond - (t_surf - t_coolant_c) / r_conv) / c_surf

        return [dt_core_dt, dt_surf_dt]

    # 5. Solve using SciPy RK45 explicit Runge-Kutta solver
    num_eval_points = 100
    t_eval = np.linspace(0.0, duration_s, num_eval_points)
    initial_state = [ambient_temp_c, ambient_temp_c]

    sol = solve_ivp(
        btms_ode,
        (0.0, duration_s),
        initial_state,
        t_eval=t_eval,
        method="RK45",
        rtol=1e-5,
        atol=1e-6,
    )

    t_core_arr = sol.y[0]
    t_surf_arr = sol.y[1]
    delta_t_arr = t_core_arr - t_surf_arr

    # 6. Reconstruct time-series components for telemetry inspection
    time_series: List[Dict[str, float]] = []
    for idx, t_s in enumerate(sol.t):
        tc = float(t_core_arr[idx])
        ts = float(t_surf_arr[idx])
        dt = float(delta_t_arr[idx])
        soc_val = min(1.0, (current_a * t_s) / (cell_capacity_ah * 3600.0))
        tk = tc + 273.15

        ea_over_r = 1600.0
        r_soc = 1.0 + 0.25 * ((soc_val - 0.5) ** 2)
        r_temp = np.exp(ea_over_r * (1.0 / tk - 1.0 / 298.15))
        r_int = 0.0012 * r_soc * r_temp

        qj = (current_a ** 2) * r_int
        qe = - current_a * tk * compute_lfp_entropic_coefficient(soc_val)
        qt = max(0.0, qj + qe)

        time_series.append({
            "time_s": round(float(t_s), 2),
            "soc": round(float(soc_val), 4),
            "t_core_c": round(tc, 3),
            "t_surf_c": round(ts, 3),
            "delta_t_c": round(dt, 3),
            "q_joule_w": round(float(qj), 3),
            "q_entropic_w": round(float(qe), 3),
            "q_total_w": round(float(qt), 3),
        })

    # 7. Automotive compliance metrics (IATF 16949 / ISO 26262 limits)
    max_core_temp_c = round(float(np.max(t_core_arr)), 3)
    max_surface_temp_c = round(float(np.max(t_surf_arr)), 3)
    max_thermal_gradient_c = round(float(np.max(delta_t_arr)), 3)

    # Compliance rules: max thermal gradient < 3.0°C and surface temperature < 45.0°C
    is_compliant = bool(max_thermal_gradient_c < 3.0 and max_surface_temp_c < 45.0)

    if is_compliant:
        verdict = (
            f"COMPLIANT: Max thermal gradient ({max_thermal_gradient_c:.2f}°C < 3.00°C) "
            f"and surface temperature ({max_surface_temp_c:.2f}°C < 45.00°C) satisfy "
            f"IATF 16949 / ISO 26262 automotive cell safety criteria."
        )
    else:
        reasons = []
        if max_thermal_gradient_c >= 3.0:
            reasons.append(f"Gradient {max_thermal_gradient_c:.2f}°C ≥ 3.00°C threshold")
        if max_surface_temp_c >= 45.0:
            reasons.append(f"Surface temp {max_surface_temp_c:.2f}°C ≥ 45.00°C safety cap")
        verdict = f"NON-COMPLIANT HAZARD: {' and '.join(reasons)}. Insufficient coolant flow for selected C-rate."

    return BTMSSimulationResult(
        params={
            "c_rate": float(c_rate),
            "ambient_temp_c": float(ambient_temp_c),
            "coolant_flow_lpm": float(coolant_flow_lpm),
            "duration_s": float(duration_s),
            "cell_capacity_ah": float(cell_capacity_ah),
        },
        max_core_temp_c=max_core_temp_c,
        max_surface_temp_c=max_surface_temp_c,
        max_thermal_gradient_c=max_thermal_gradient_c,
        is_compliant=is_compliant,
        summary_verdict=verdict,
        time_series=time_series,
    )
