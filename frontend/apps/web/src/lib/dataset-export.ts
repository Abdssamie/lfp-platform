import type {
  CellEvaluation,
  LfpDatasetResponse,
  LfpDQDV,
  LfpDriveProfilePoint,
  LfpGittPoint,
  LfpStepSummary,
  LfpVQPoint,
  BatchSummaryResponse,
} from "@/types/api";

function triggerBrowserDownload(content: string | Blob, filename: string, mimeType: string): void {
  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportStepsToCsv(steps: LfpStepSummary[]): string {
  const headers = [
    "Step_Index",
    "Regime",
    "Step_Name",
    "C_Rate",
    "Step_Type",
    "Duration_Hours",
    "Duration_Seconds",
    "Current_Amps",
    "Capacity_Ah",
    "Energy_Wh",
    "Min_Voltage_V",
    "Max_Voltage_V",
    "Point_Count",
  ];

  const rows = steps.map((s) => [
    s.step_index,
    s.regime ?? "",
    s.step_name,
    s.c_rate,
    s.step_type,
    s.duration_h ?? (s.duration_s / 3600).toFixed(2),
    s.duration_s,
    s.current_a,
    s.capacity_ah,
    s.energy_wh,
    s.min_v,
    s.max_v,
    s.point_count,
  ]);

  return [headers.join(","), ...rows.map((r) => r.map(escapeCsvField).join(","))].join("\n");
}

export function exportFormationLotToCsv(evaluations: CellEvaluation[]): string {
  const headers = [
    "Channel_ID",
    "Cell_Serial_Number",
    "Actual_Capacity_Ah",
    "Nominal_Capacity_Ah",
    "Capacity_Retention_Pct",
    "DCIR_10s_mOhm",
    "K_Value_mV_Day",
    "Coulombic_Efficiency_Pct",
    "Primary_Redox_Peak_V",
    "IATF_Grade",
    "Failure_Reasons",
  ];

  const rows = evaluations.map((e) => [
    e.channel_id,
    e.cell_id,
    e.actual_capacity_ah,
    e.nominal_capacity_ah,
    e.capacity_retention_pct,
    e.dcir_mohm,
    e.k_value_mv_day,
    e.coulombic_efficiency_pct,
    e.primary_peak_v,
    e.grade,
    (e.failure_reasons || []).join(" | "),
  ]);

  return [headers.join(","), ...rows.map((r) => r.map(escapeCsvField).join(","))].join("\n");
}

export function exportVqCurvesToCsv(curves: LfpVQPoint[]): string {
  const headers = [
    "Capacity_Ah",
    "Voltage_V",
    "Rate_Label",
    "Step_Type",
  ];

  const rows = curves.map((c) => [
    c.capacity_ah,
    c.voltage_v,
    c.rate_label,
    c.step_type,
  ]);

  return [headers.join(","), ...rows.map((r) => r.map(escapeCsvField).join(","))].join("\n");
}

export function exportDqdvToCsv(dqdv: LfpDQDV): string {
  const headers = ["Potential_V", "dQ_dV_Charge_Ah_V", "dQ_dV_Discharge_Ah_V"];

  const rows = dqdv.v_grid.map((v: number, idx: number) => [
    v,
    dqdv.charge_dqdv[idx] ?? "",
    dqdv.discharge_dqdv[idx] ?? "",
  ]);

  return [headers.join(","), ...rows.map((r: (string | number)[]) => r.map(escapeCsvField).join(","))].join("\n");
}

export function exportGittToCsv(pulses: LfpGittPoint[]): string {
  const headers = [
    "Pulse_Index",
    "SOC",
    "Voltage_Pulse_End_V",
    "OCV_Relaxed_V",
    "Current_A",
    "Internal_Resistance_mOhm",
    "D_Li_Diffusion_cm2_s",
  ];

  const rows = pulses.map((p) => [
    p.pulse_index,
    p.soc,
    p.voltage_pulse_end,
    p.ocv_relaxed,
    p.current_a,
    p.r_internal_mohm,
    p.d_li_cm2_s,
  ]);

  return [headers.join(","), ...rows.map((r) => r.map(escapeCsvField).join(","))].join("\n");
}

export function exportDriveProfileToCsv(profile: LfpDriveProfilePoint[]): string {
  const headers = [
    "Time_Seconds",
    "Time_Hours",
    "Current_Amps",
    "Voltage_V",
    "Net_Capacity_Ah",
    "SOC",
  ];

  const rows = profile.map((p) => [
    p.time_s,
    p.time_h,
    p.current_a,
    p.voltage_v,
    p.net_ah,
    p.soc,
  ]);

  return [headers.join(","), ...rows.map((r) => r.map(escapeCsvField).join(","))].join("\n");
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const jsonContent = JSON.stringify(data, null, 2);
  triggerBrowserDownload(jsonContent, filename, "application/json;charset=utf-8");
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  triggerBrowserDownload(csvContent, filename, "text/csv;charset=utf-8");
}

export function downloadRawServerFile(fileKey: string, fallbackFilename: string): void {
  const link = document.createElement("a");
  link.href = `/api/lfp/raw/${fileKey}`;
  link.download = fallbackFilename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFullUnifiedBundle(
  lfp: LfpDatasetResponse,
  batch: BatchSummaryResponse
): void {
  const bundle = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      platform: "LFP Giga Line Analytics & Electrochemical Platform",
      system_target: "LiFePO4 / Graphite 50Ah Automotive Prismatic Cell",
      standards: ["IATF 16949:2016", "IEC 62660-1", "ISO 12405-4"],
    },
    cell_metadata: lfp.metadata,
    protocol_12_steps: lfp.steps,
    electrochemical_curves: {
      pseudo_ocv_vq: lfp.vq_curves,
      capacitive_derivative_dqdv: lfp.dqdv_curve,
    },
    gitt_kinetics: {
      pulses: lfp.gitt_pulses,
      timeline: lfp.gitt_timeline,
    },
    ev_drive_profile_1: lfp.drive_profile,
    formation_line_batch_spc: {
      batch_id: batch.batch_id,
      total_cells: batch.total_cells,
      yield_pct: batch.yield_pct,
      grade_a_count: batch.grade_a_count,
      grade_b_count: batch.grade_b_count,
      scrap_count: batch.scrap_count,
      evaluations: batch.evaluations,
    },
  };

  downloadJsonFile("LG_Chem_LFP_50Ah_Platform_Full_Bundle.json", bundle);
}
