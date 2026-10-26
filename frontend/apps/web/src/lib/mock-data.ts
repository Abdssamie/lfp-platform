import type {
  BatchSummaryResponse,
  CellEvaluation,
  ScreeningScatterResponse,
  SPCSummaryResponse,
  NovonixDatasetResponse,
  NewareDatasetResponse,
  LfpDatasetResponse,
  ScreeningScatterPoint,
  SPCPositionPoint,
  SPCMetricSummary,
} from "@/types/api";

export const MOCK_CELLS: CellEvaluation[] = Array.from({ length: 24 }, (_, i) => {
  const ch = i + 1;
  const isMicroShort = ch === 14;
  const isHighDcir = ch === 20;
  const isMarginal = ch === 7;

  let grade: CellEvaluation["grade"] = "Grade A";
  const failure_reasons: string[] = [];
  let kValue = 0.075 + (i % 5) * 0.008;
  let dcir = 1.15 + (i % 6) * 0.04;
  let cap = 49.85 + (i % 4) * 0.12;

  if (isMicroShort) {
    grade = "Scrap";
    kValue = 0.285;
    failure_reasons.push("Excessive voltage relaxation drop (K-value > 0.20 mV/day: Micro-short risk)");
  } else if (isHighDcir) {
    grade = "Scrap";
    dcir = 2.45;
    failure_reasons.push("Internal resistance exceeds limit (DCIR > 2.0 mΩ)");
  } else if (isMarginal) {
    grade = "Grade B";
    cap = 48.75;
    failure_reasons.push("Sub-nominal capacity (48.75 Ah < 49.00 Ah Grade A limit)");
  }

  return {
    cell_id: `LFP-50AH-202610-${String(ch).padStart(3, "0")}`,
    channel_id: ch,
    batch_id: "BATCH_202610A",
    nominal_capacity_ah: 50.0,
    actual_capacity_ah: parseFloat(cap.toFixed(4)),
    capacity_retention_pct: parseFloat(((cap / 50.0) * 100).toFixed(2)),
    coulombic_efficiency_pct: isMicroShort ? 97.4 : 99.82,
    dcir_mohm: parseFloat(dcir.toFixed(2)),
    k_value_mv_day: parseFloat(kValue.toFixed(4)),
    primary_peak_v: 3.398,
    primary_peak_height: 48.2,
    grade,
    failure_reasons,
  };
});

const SPC_METRIC: SPCMetricSummary = {
  metric_name: "Actual Capacity (Ah)",
  mean: 49.88,
  std_dev: 0.22,
  usl: 51.5,
  lsl: 48.5,
  ucl: 50.54,
  lcl: 49.22,
  cp: 1.52,
  cpk: 1.42,
  pp: 1.48,
  ppk: 1.38,
  is_capable: true,
};

export const MOCK_BATCH: BatchSummaryResponse = {
  batch_id: "BATCH_202610A",
  total_cells: 24,
  grade_a_count: 21,
  grade_b_count: 1,
  scrap_count: 2,
  yield_pct: 87.5,
  spc_capacity: SPC_METRIC,
  micro_short_alert: {
    has_hazard: true,
    quarantined_channels: [14],
    alert_message: "High relaxation drop detected on channel 14 (K-value = 0.2850 mV/day). Channel quarantined.",
  },
  evaluations: MOCK_CELLS,
};

const SCREENING_POINTS: ScreeningScatterPoint[] = MOCK_CELLS.map((c) => ({
  cell_id: c.cell_id,
  channel_id: c.channel_id,
  k_value_mv_day: c.k_value_mv_day,
  dcir_mohm: c.dcir_mohm,
  actual_capacity_ah: c.actual_capacity_ah,
  grade: c.grade,
  is_micro_short: c.k_value_mv_day >= 0.15,
  is_high_dcir: c.dcir_mohm >= 1.8,
}));

export const MOCK_SCREENING: ScreeningScatterResponse = {
  k_threshold_mv_day: 0.15,
  dcir_threshold_mohm: 1.8,
  cells: SCREENING_POINTS,
};

const SPC_POINTS: SPCPositionPoint[] = MOCK_CELLS.map((c, i) => ({
  channel_id: c.channel_id,
  cell_id: c.cell_id,
  capacity_ah: c.actual_capacity_ah,
  subgroup_id: Math.floor(i / 4) + 1,
}));

export const MOCK_SPC: SPCSummaryResponse = {
  metric_name: "Actual Capacity (Ah)",
  mean: 49.88,
  std_dev: 0.22,
  usl: 51.5,
  lsl: 48.5,
  ucl: 50.54,
  lcl: 49.22,
  cp: 1.52,
  cpk: 1.42,
  pp: 1.48,
  ppk: 1.38,
  is_capable: true,
  data_points: SPC_POINTS,
};

export const MOCK_NOVONIX: NovonixDatasetResponse = {
  metadata: {
    cell_id: "NOVONIX-LFP-8001",
    channel_name: "Channel 4",
    protocol: "High-Precision Coulombic Efficiency & DCIR",
    total_runtime_h: 48.5,
    total_rows: 12500,
    total_steps: 12,
    measured_capacity_ah: 2.14,
    nominal_capacity_ah: 2.1,
    min_voltage_v: 2.5,
    max_voltage_v: 3.65,
    mean_dcir_mohm: 14.8,
    mean_temp_c: 25.2,
  },
  telemetry: Array.from({ length: 60 }, (_, i) => ({
    runtime_h: parseFloat(((i * 0.8).toFixed(2))),
    voltage_v: parseFloat((3.2 + Math.sin(i / 15) * 0.25).toFixed(3)),
    current_a: 1.05,
    capacity_ah: parseFloat(((i / 60) * 2.1).toFixed(3)),
    temp_c: parseFloat((25.0 + Math.sin(i / 10) * 1.5).toFixed(2)),
    step_number: 1,
  })),
  vq_curve: Array.from({ length: 50 }, (_, i) => ({
    capacity_ah: parseFloat(((i / 50) * 2.1).toFixed(3)),
    voltage_v: parseFloat((2.8 + Math.pow(i / 50, 0.4) * 0.7).toFixed(3)),
    step_type: "CC_Chg",
  })),
  dqdv_curve: {
    v_grid: Array.from({ length: 40 }, (_, i) => parseFloat((3.15 + (i / 40) * 0.35).toFixed(3))),
    dqdv_smooth: Array.from({ length: 40 }, (_, i) => {
      const v = 3.15 + (i / 40) * 0.35;
      return parseFloat((Math.exp(-Math.pow((v - 3.4) / 0.03, 2)) * 35).toFixed(2));
    }),
    peak_v: 3.4,
    peak_height: 35.2,
  },
  dcir_pulses: [
    {
      step: 3,
      type: "Discharge Pulse",
      current_a: 2.1,
      v_mean: 3.28,
      v_start: 3.32,
      v_end: 3.29,
      delta_v: 0.031,
      duration_s: 10,
      dcir_mohm: 14.8,
      temp_c: 25.1,
    },
  ],
  steps: [
    {
      step_number: 1,
      step_type: "Rest",
      start_time_h: 0.0,
      duration_s: 3600,
      avg_current_a: 0.0,
      min_v: 3.25,
      max_v: 3.25,
      dcir_mohm: null,
      point_count: 360,
    },
    {
      step_number: 2,
      step_type: "CC_Chg",
      start_time_h: 1.0,
      duration_s: 7200,
      avg_current_a: 1.05,
      min_v: 3.25,
      max_v: 3.65,
      dcir_mohm: 14.5,
      point_count: 720,
    },
  ],
};

export const MOCK_NEWARE: NewareDatasetResponse = {
  metadata: {
    cell_id: "NEWARE-LFP-50A-FAST",
    cycler: "Neware CT-4008T-5V100A",
    test_type: "Multi-Rate Fast Charge Qualification",
    total_runtime_h: 36.4,
    total_rows: 18400,
    total_steps: 16,
    nominal_capacity_ah: 50.0,
    measured_capacity_ah: 49.82,
    min_voltage_v: 2.5,
    max_voltage_v: 3.65,
    max_discharge_current_a: 150.0,
    mean_temp_c: 27.8,
    time_bug_resolved: true,
    quarantine_events_count: 0,
  },
  telemetry: Array.from({ length: 50 }, (_, i) => ({
    runtime_h: parseFloat(((i * 0.7).toFixed(2))),
    voltage_v: parseFloat((3.1 + (i / 50) * 0.5).toFixed(3)),
    current_a: 50.0,
    capacity_ah: parseFloat(((i / 50) * 50.0).toFixed(2)),
    temp_c: parseFloat((25.0 + (i / 50) * 8.5).toFixed(2)),
    step_index: 2,
    step_type: "CC_Chg",
  })),
  rate_curves: Array.from({ length: 40 }, (_, i) => ({
    capacity_ah: parseFloat(((i / 40) * 50.0).toFixed(2)),
    voltage_v: parseFloat((3.1 + Math.pow(i / 40, 0.35) * 0.48).toFixed(3)),
    rate_label: "1.0C",
    c_rate: 1.0,
  })),
  dqdv_curve: {
    v_grid: Array.from({ length: 40 }, (_, i) => parseFloat((3.2 + (i / 40) * 0.35).toFixed(3))),
    dqdv_smooth: Array.from({ length: 40 }, (_, i) => {
      const v = 3.2 + (i / 40) * 0.35;
      return parseFloat((Math.exp(-Math.pow((v - 3.42) / 0.04, 2)) * 42).toFixed(2));
    }),
    peak_v: 3.42,
    peak_height: 42.1,
  },
  rate_retention: [
    { rate_c: 0.5, rate_label: "0.5C", current_a: 25.0, capacity_ah: 50.2, retention_pct: 100.0, duration_min: 120, energy_wh: 165.0 },
    { rate_c: 1.0, rate_label: "1.0C", current_a: 50.0, capacity_ah: 49.8, retention_pct: 99.2, duration_min: 60, energy_wh: 163.5 },
    { rate_c: 2.0, rate_label: "2.0C", current_a: 100.0, capacity_ah: 48.6, retention_pct: 96.8, duration_min: 29.5, energy_wh: 158.0 },
    { rate_c: 3.0, rate_label: "3.0C", current_a: 150.0, capacity_ah: 46.9, retention_pct: 93.4, duration_min: 19.0, energy_wh: 151.2 },
  ],
  steps: [
    {
      step_index: 1,
      step_type: "Rest",
      start_time_h: 0.0,
      duration_s: 900,
      avg_current_a: 0.0,
      capacity_ah: 0.0,
      min_v: 3.28,
      max_v: 3.28,
      point_count: 90,
    },
  ],
};

export const MOCK_LFP: LfpDatasetResponse = {
  metadata: {
    cell_id: "CATL-LFP-50AH-PROD",
    manufacturer: "Contemporary Amperex Technology (CATL)",
    positive_electrode: "LiFePO4 (LFP Olivine)",
    negative_electrode: "Artificial Mesocarbon Microbead Graphite",
    nominal_capacity_ah: 50.0,
    measured_capacity_ah: 50.12,
    nominal_voltage_v: 3.2,
    min_voltage_v: 2.5,
    max_voltage_v: 3.65,
    total_runtime_h: 24.2,
    total_rows: 14400,
    total_steps: 8,
    cell_weight_g: 850.0,
    plateau_fraction_pct: 78.5,
  },
  telemetry: [
    // Charge half-cycle (0h to 12.25h) at C/12 (+4.08A)
    ...Array.from({ length: 50 }, (_, i) => {
      const frac = i / 49;
      const tH = frac * 12.25;
      const v = frac < 0.1
        ? 3.10 + frac * 2.4
        : frac > 0.9
        ? 3.42 + (frac - 0.9) * 2.3
        : 3.34 + frac * 0.08;
      return {
        runtime_h: parseFloat(tH.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        current_a: 4.08,
        capacity_ah: parseFloat((frac * 50.0).toFixed(2)),
        soc: parseFloat(frac.toFixed(2)),
        step_type: "Charge",
        c_rate: "C/12 (0.08C)",
      };
    }),
    // Discharge half-cycle (12.25h to 24.5h) at C/12 (-4.08A)
    ...Array.from({ length: 50 }, (_, i) => {
      const frac = i / 49;
      const tH = 12.25 + frac * 12.25;
      const dFrac = 1 - frac;
      const v = frac < 0.1
        ? 3.38 - frac * 0.8
        : frac > 0.9
        ? 3.26 - (frac - 0.9) * 4.6
        : 3.30 - frac * 0.05;
      return {
        runtime_h: parseFloat(tH.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        current_a: -4.08,
        capacity_ah: parseFloat((dFrac * 50.0).toFixed(2)),
        soc: parseFloat(dFrac.toFixed(2)),
        step_type: "Discharge",
        c_rate: "C/12 (0.08C)",
      };
    }),
  ],
  vq_curves: [
    // C/12 Charge (0.08C - 4.08A)
    ...Array.from({ length: 45 }, (_, i) => {
      const q = (i / 44) * 50.0;
      const frac = i / 44;
      const v = frac < 0.08
        ? 3.05 + frac * 3.75
        : frac > 0.92
        ? 3.42 + (frac - 0.92) * 2.875
        : 3.35 + frac * 0.07;
      return {
        capacity_ah: parseFloat(q.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        rate_label: "C/12 Charge (4.08A)",
        step_type: "Charge",
      };
    }),
    // C/12 Discharge (0.08C - 4.08A)
    ...Array.from({ length: 45 }, (_, i) => {
      const q = (i / 44) * 50.0;
      const frac = i / 44;
      const v = frac < 0.08
        ? 3.35 - frac * 0.75
        : frac > 0.92
        ? 3.27 - (frac - 0.92) * 3.375
        : 3.29 - frac * 0.04;
      return {
        capacity_ah: parseFloat(q.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        rate_label: "C/12 Discharge (4.08A)",
        step_type: "Discharge",
      };
    }),
    // C/6 Charge (0.17C - 8.17A) - Higher overpotential
    ...Array.from({ length: 45 }, (_, i) => {
      const q = (i / 44) * 49.5;
      const frac = i / 44;
      const v = frac < 0.08
        ? 3.12 + frac * 3.8
        : frac > 0.92
        ? 3.45 + (frac - 0.92) * 2.5
        : 3.40 + frac * 0.06;
      return {
        capacity_ah: parseFloat(q.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        rate_label: "C/6 Charge (8.17A)",
        step_type: "Charge",
      };
    }),
    // C/6 Discharge (0.17C - 8.17A) - Lower overpotential
    ...Array.from({ length: 45 }, (_, i) => {
      const q = (i / 44) * 49.5;
      const frac = i / 44;
      const v = frac < 0.08
        ? 3.30 - frac * 0.8
        : frac > 0.92
        ? 3.22 - (frac - 0.92) * 3.25
        : 3.24 - frac * 0.04;
      return {
        capacity_ah: parseFloat(q.toFixed(2)),
        voltage_v: parseFloat(v.toFixed(3)),
        rate_label: "C/6 Discharge (8.17A)",
        step_type: "Discharge",
      };
    }),
  ],
  dqdv_curve: {
    v_grid: Array.from({ length: 30 }, (_, i) => parseFloat((3.2 + (i / 30) * 0.35).toFixed(3))),
    charge_dqdv: Array.from({ length: 30 }, (_, i) => {
      const v = 3.2 + (i / 30) * 0.35;
      return parseFloat((Math.exp(-Math.pow((v - 3.4) / 0.03, 2)) * 60).toFixed(2));
    }),
    discharge_dqdv: Array.from({ length: 30 }, (_, i) => {
      const v = 3.2 + (i / 30) * 0.35;
      return parseFloat((Math.exp(-Math.pow((v - 3.32) / 0.03, 2)) * 55).toFixed(2));
    }),
    charge_peak_v: 3.4,
    charge_peak_height: 60.0,
    discharge_peak_v: 3.32,
    discharge_peak_height: 55.0,
    delta_v_hysteresis_mv: 80.0,
  },
  steps: [
    {
      step_index: 1,
      regime: "Constant Current",
      step_name: "C/12 Quasi-Equilibrium Formation Charge",
      c_rate: "C/12 (0.08C)",
      step_type: "Charge",
      duration_s: 43920,
      duration_h: 12.2,
      current_a: 4.08,
      capacity_ah: 50.0,
      energy_wh: 165.2,
      min_v: 2.5,
      max_v: 3.6,
      point_count: 44000,
    },
    {
      step_index: 2,
      regime: "Constant Current",
      step_name: "C/12 Quasi-Equilibrium Full Discharge",
      c_rate: "C/12 (0.08C)",
      step_type: "Discharge",
      duration_s: 43920,
      duration_h: 12.2,
      current_a: 4.08,
      capacity_ah: 50.0,
      energy_wh: 160.8,
      min_v: 2.5,
      max_v: 3.6,
      point_count: 44000,
    },
    {
      step_index: 3,
      regime: "Constant Current",
      step_name: "C/6 Fast Reference Benchmark Charge",
      c_rate: "C/6 (0.17C)",
      step_type: "Charge",
      duration_s: 21960,
      duration_h: 6.1,
      current_a: 8.17,
      capacity_ah: 49.8,
      energy_wh: 164.1,
      min_v: 2.5,
      max_v: 3.6,
      point_count: 22000,
    },
    {
      step_index: 4,
      regime: "Constant Current",
      step_name: "C/6 Fast Reference Benchmark Discharge",
      c_rate: "C/6 (0.17C)",
      step_type: "Discharge",
      duration_s: 21960,
      duration_h: 6.1,
      current_a: 8.17,
      capacity_ah: 49.7,
      energy_wh: 159.4,
      min_v: 2.5,
      max_v: 3.6,
      point_count: 22000,
    },
    {
      step_index: 5,
      regime: "GITT Titration",
      step_name: "GITT Phase Initiation Pulses (0% to 20% SOC)",
      c_rate: "0.33C (16.33A)",
      step_type: "Titration Pulse",
      duration_s: 21600,
      duration_h: 6.0,
      current_a: 16.33,
      capacity_ah: 10.0,
      energy_wh: 32.2,
      min_v: 2.5,
      max_v: 3.28,
      point_count: 12,
    },
    {
      step_index: 6,
      regime: "GITT Titration",
      step_name: "GITT Two-Phase Equilibrium Plateau (20% to 80% SOC)",
      c_rate: "0.33C (16.33A)",
      step_type: "Titration Pulse",
      duration_s: 259200,
      duration_h: 72.0,
      current_a: 16.33,
      capacity_ah: 30.0,
      energy_wh: 101.4,
      min_v: 3.28,
      max_v: 3.42,
      point_count: 32,
    },
    {
      step_index: 7,
      regime: "GITT Titration",
      step_name: "GITT High-SOC Delithiation End Phase (80% to 100% SOC)",
      c_rate: "0.33C (16.33A)",
      step_type: "Titration Pulse",
      duration_s: 72000,
      duration_h: 20.0,
      current_a: 16.33,
      capacity_ah: 10.0,
      energy_wh: 34.8,
      min_v: 3.42,
      max_v: 3.6,
      point_count: 14,
    },
    {
      step_index: 8,
      regime: "GITT Titration",
      step_name: "GITT Open-Circuit Potential Relaxation Final Rest",
      c_rate: "0.0C (Rest)",
      step_type: "Relaxation Rest",
      duration_s: 73462,
      duration_h: 20.4,
      current_a: 0.0,
      capacity_ah: 0.0,
      energy_wh: 0.0,
      min_v: 3.33,
      max_v: 3.35,
      point_count: 35500,
    },
    {
      step_index: 9,
      regime: "Dynamic EV Drive",
      step_name: "EV Drive Cycle Phase 1: Urban Transient Stop & Go",
      c_rate: "Dynamic (-0.4C to +0.7C)",
      step_type: "Dynamic Swings",
      duration_s: 5400,
      duration_h: 1.5,
      current_a: 8.45,
      capacity_ah: 8.2,
      energy_wh: 26.9,
      min_v: 3.21,
      max_v: 3.34,
      point_count: 45000,
    },
    {
      step_index: 10,
      regime: "Dynamic EV Drive",
      step_name: "EV Drive Cycle Phase 2: Highway High-Rate Discharges",
      c_rate: "Dynamic Peak (+47.2A)",
      step_type: "Peak Acceleration",
      duration_s: 6480,
      duration_h: 1.8,
      current_a: 18.6,
      capacity_ah: 12.8,
      energy_wh: 41.5,
      min_v: 3.13,
      max_v: 3.33,
      point_count: 55000,
    },
    {
      step_index: 11,
      regime: "Dynamic EV Drive",
      step_name: "EV Drive Cycle Phase 3: Regenerative Energy Recovery",
      c_rate: "Dynamic Regen (-25.3A)",
      step_type: "Regenerative Braking",
      duration_s: 4320,
      duration_h: 1.2,
      current_a: -12.2,
      capacity_ah: -5.4,
      energy_wh: -17.8,
      min_v: 3.24,
      max_v: 3.35,
      point_count: 42000,
    },
    {
      step_index: 12,
      regime: "Dynamic EV Drive",
      step_name: "EV Drive Cycle Phase 4: Final Depletion & Post-Drive Rest",
      c_rate: "0.0C (Rest)",
      step_type: "Post-Drive Rest",
      duration_s: 2599,
      duration_h: 0.72,
      current_a: 0.0,
      capacity_ah: 0.0,
      energy_wh: 0.0,
      min_v: 3.28,
      max_v: 3.29,
      point_count: 188000,
    },
  ],
  gitt_pulses: Array.from({ length: 25 }, (_, i) => {
    const soc = parseFloat((0.04 + (i / 25) * 0.92).toFixed(3));
    return {
      pulse_index: i + 1,
      soc,
      voltage_pulse_end: parseFloat((3.26 + Math.pow(soc, 0.5) * 0.22).toFixed(4)),
      ocv_relaxed: parseFloat((3.24 + Math.pow(soc, 0.5) * 0.19).toFixed(4)),
      current_a: -16.33,
      r_internal_mohm: parseFloat((4.5 + Math.sin(soc * Math.PI) * 1.5).toFixed(2)),
      d_li_cm2_s: parseFloat((2.5e-14 * (0.8 + 0.4 * Math.cos(soc * Math.PI * 2))).toExponential(2)),
    };
  }),
  gitt_timeline: Array.from({ length: 50 }, (_, i) => ({
    runtime_h: parseFloat(((i * 2.36).toFixed(2))),
    voltage_v: parseFloat((3.2 + Math.sin(i * 0.6) * 0.08 + (i / 50) * 0.18).toFixed(4)),
    current_a: (i % 2 === 0) ? -16.33 : 0.0,
    soc: parseFloat((i / 50).toFixed(3)),
  })),
  drive_profile: Array.from({ length: 60 }, (_, i) => ({
    time_s: i * 313.3,
    time_h: parseFloat(((i * 313.3) / 3600).toFixed(3)),
    voltage_v: parseFloat((3.32 - (i / 60) * 0.12 + Math.sin(i * 0.9) * 0.04).toFixed(4)),
    current_a: parseFloat((Math.sin(i * 0.8) * 30 + 5).toFixed(2)),
    net_ah: parseFloat(((i / 60) * 29.4).toFixed(3)),
    soc: parseFloat((0.8 - (i / 60) * 0.6).toFixed(3)),
  })),
};
