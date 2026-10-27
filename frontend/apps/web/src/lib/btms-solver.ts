import type { BTMSRequest, BTMSResponse, BTMSSimulationPoint } from "@/types/api";

/**
 * LiFePO4 (LFP) entropic coefficient dU_ocv/dT in V/K as a function of SOC.
 * Transitions between endothermic and exothermic behavior across the two-phase
 * plateau (-0.08 mV/K to +0.06 mV/K).
 */
function computeLfpEntropicCoefficient(soc: number): number {
  const s = Math.max(0.0, Math.min(1.0, soc));
  const mvPerK = -0.08 + 0.62 * s - 0.95 * Math.pow(s, 2) + 0.39 * Math.pow(s, 3);
  return mvPerK * 1e-3;
}

/**
 * Client-side 1D two-state coupled electro-thermal simulator (Bernardi equation + Dittus-Boelter cooling).
 * Solves the ODE system using a 4th-order Runge-Kutta (RK4) integration algorithm.
 * Guarantees zero-downtime, sub-millisecond execution even when the remote Python backend is offline or on serverless edge.
 */
export function solveBTMSSimulation(params: BTMSRequest): BTMSResponse {
  const cRate = Number(params.c_rate) || 2.0;
  const ambientTempC = Number(params.ambient_temp_c) ?? 25.0;
  const flowLpm = Math.max(0.1, Number(params.coolant_flow_lpm) || 4.0);
  const cellCapacityAh = Number(params.cell_capacity_ah) || 50.0;
  const durationS = 1200.0;

  const currentA = cRate * cellCapacityAh;
  const tCoolantC = ambientTempC;

  // 1. Thermal mass: Prismatic LFP 50Ah (m ≈ 1.15 kg, Cp ≈ 1100 J/(kg·K))
  const cellMassKg = 1.15;
  const specificHeat = 1100.0;
  const cTotal = cellMassKg * specificHeat; // 1265.0 J/K
  const cCore = 0.65 * cTotal; // ~822 J/K
  const cSurf = 0.35 * cTotal; // ~443 J/K

  // 2. Convective cooling: Dittus-Boelter correlation (Nu ~ Re^0.8) for 50/50 WEG
  const vRefLpm = 4.0;
  const hRefWM2K = 800.0;
  const aPlateM2 = 0.03;
  const hConv = hRefWM2K * Math.pow(flowLpm / vRefLpm, 0.8);
  const rConv = 1.0 / Math.max(1.0, hConv * aPlateM2);

  // 3. Conduction & boundary layer thermal resistance (Core to cooling interface)
  const rCoreInternal = 0.07;
  const rInterfaceBase = 0.06;
  const rCond = rCoreInternal + rInterfaceBase / Math.pow(flowLpm / vRefLpm, 0.4);

  // ODE derivative function: f(t, [tCore, tSurf]) -> [dtCore, dtSurf]
  function derivatives(t: number, tCore: number, tSurf: number): [number, number] {
    const soc = Math.min(1.0, (currentA * t) / (cellCapacityAh * 3600.0));
    const tCoreK = tCore + 273.15;

    // Arrhenius internal resistance model (R_ref = 1.2 mΩ at 25°C)
    const eaOverR = 1600.0;
    const rSoc = 1.0 + 0.25 * Math.pow(soc - 0.5, 2);
    const rTemp = Math.exp(eaOverR * (1.0 / tCoreK - 1.0 / 298.15));
    const rInt = 0.0012 * rSoc * rTemp;

    // Bernardi heat generation: Q_gen = Q_joule + Q_entropic
    const qJoule = Math.pow(currentA, 2) * rInt;
    const qEntropic = -currentA * tCoreK * computeLfpEntropicCoefficient(soc);
    const qGen = Math.max(0.0, qJoule + qEntropic);

    const dtCore = (qGen - (tCore - tSurf) / rCond) / cCore;
    const dtSurf = ((tCore - tSurf) / rCond - (tSurf - tCoolantC) / rConv) / cSurf;

    return [dtCore, dtSurf];
  }

  // Classical 4th-Order Runge-Kutta (RK4) integration with step dt = 1.0 s
  const dt = 1.0;
  const totalSteps = Math.floor(durationS / dt);
  const sampleInterval = Math.floor(totalSteps / 40); // 41 sampling points

  let t = 0.0;
  let tCore = ambientTempC;
  let tSurf = ambientTempC;

  const timeSeries: BTMSSimulationPoint[] = [];

  function recordPoint(currentTime: number, currentTC: number, currentTS: number) {
    const soc = Math.min(1.0, (currentA * currentTime) / (cellCapacityAh * 3600.0));
    const tk = currentTC + 273.15;
    const eaOverR = 1600.0;
    const rSoc = 1.0 + 0.25 * Math.pow(soc - 0.5, 2);
    const rTemp = Math.exp(eaOverR * (1.0 / tk - 1.0 / 298.15));
    const rInt = 0.0012 * rSoc * rTemp;

    const qJoule = Math.pow(currentA, 2) * rInt;
    const qEntropic = -currentA * tk * computeLfpEntropicCoefficient(soc);
    const qTotal = Math.max(0.0, qJoule + qEntropic);
    const deltaT = currentTC - currentTS;

    timeSeries.push({
      time_s: Math.round(currentTime),
      soc: parseFloat(soc.toFixed(4)),
      t_core_c: parseFloat(currentTC.toFixed(2)),
      t_surf_c: parseFloat(currentTS.toFixed(2)),
      delta_t_c: parseFloat(deltaT.toFixed(2)),
      q_joule_w: parseFloat(qJoule.toFixed(2)),
      q_entropic_w: parseFloat(qEntropic.toFixed(2)),
      q_total_w: parseFloat(qTotal.toFixed(2)),
    });
  }

  // Record initial state at t = 0
  recordPoint(0, tCore, tSurf);

  let maxCore = tCore;
  let maxSurf = tSurf;
  let maxGrad = tCore - tSurf;

  for (let step = 1; step <= totalSteps; step++) {
    // RK4 integration
    const [k1_c, k1_s] = derivatives(t, tCore, tSurf);
    const [k2_c, k2_s] = derivatives(t + 0.5 * dt, tCore + 0.5 * dt * k1_c, tSurf + 0.5 * dt * k1_s);
    const [k3_c, k3_s] = derivatives(t + 0.5 * dt, tCore + 0.5 * dt * k2_c, tSurf + 0.5 * dt * k2_s);
    const [k4_c, k4_s] = derivatives(t + dt, tCore + dt * k3_c, tSurf + dt * k3_s);

    tCore += (dt / 6.0) * (k1_c + 2 * k2_c + 2 * k3_c + k4_c);
    tSurf += (dt / 6.0) * (k1_s + 2 * k2_s + 2 * k3_s + k4_s);
    t += dt;

    if (tCore > maxCore) maxCore = tCore;
    if (tSurf > maxSurf) maxSurf = tSurf;
    if (tCore - tSurf > maxGrad) maxGrad = tCore - tSurf;

    if (step % sampleInterval === 0 || step === totalSteps) {
      if (timeSeries.length < 41 || step === totalSteps) {
        recordPoint(t, tCore, tSurf);
      }
    }
  }

  const isCompliant = maxGrad < 3.0 && maxSurf < 45.0;

  return {
    c_rate: cRate,
    ambient_temp_c: ambientTempC,
    coolant_flow_lpm: flowLpm,
    cell_capacity_ah: cellCapacityAh,
    duration_s: durationS,
    max_core_temp_c: parseFloat(maxCore.toFixed(2)),
    max_surface_temp_c: parseFloat(maxSurf.toFixed(2)),
    max_thermal_gradient_c: parseFloat(maxGrad.toFixed(2)),
    is_compliant: isCompliant,
    time_series: timeSeries,
  };
}
