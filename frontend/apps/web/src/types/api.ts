/**
 * Strongly-typed API schemas matching FastAPI backend contracts.
 * Strictly adheres to rule: NO ANY TYPE.
 */

export type CellGrade = "Grade A" | "Grade B" | "Scrap";

export interface DQDVPeak {
  peak_voltage_v: number;
  peak_height: number;
  prominence: number;
  area: number;
  phase_transition: string;
}

export interface CellEvaluation {
  cell_id: string;
  channel_id: number;
  batch_id: string;
  nominal_capacity_ah: number;
  actual_capacity_ah: number;
  capacity_retention_pct: number;
  coulombic_efficiency_pct: number;
  dcir_mohm: number;
  k_value_mv_day: number;
  primary_peak_v: number;
  primary_peak_height: number;
  grade: CellGrade;
  failure_reasons: string[];
}

export interface SPCMetricSummary {
  metric_name: string;
  mean: number;
  std_dev: number;
  usl: number;
  lsl: number;
  ucl: number;
  lcl: number;
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  is_capable: boolean;
}

export interface MicroShortAlert {
  has_hazard: boolean;
  quarantined_channels: number[];
  alert_message: string;
}

export interface BatchSummaryResponse {
  batch_id: string;
  total_cells: number;
  grade_a_count: number;
  grade_b_count: number;
  scrap_count: number;
  yield_pct: number;
  spc_capacity: SPCMetricSummary;
  micro_short_alert: MicroShortAlert;
  evaluations: CellEvaluation[];
}

export interface BatchRunRequest {
  batch_id: string;
  num_cells: number;
  micro_short_rate: number;
  high_dcir_rate: number;
  low_capacity_rate: number;
}

export interface TelemetryPoint {
  timestamp_min: number;
  voltage_v: number;
  current_a: number;
  step_type: string;
  capacity_ah: number;
}

export interface VQCurvePoint {
  capacity_ah: number;
  voltage_v: number;
  step_type: string;
}

export interface DQDVPhaseCurve {
  v_grid: number[];
  dqdv_smooth: number[];
  peaks: DQDVPeak[];
}

export interface CellDetailResponse {
  evaluation: CellEvaluation;
  telemetry: TelemetryPoint[];
  vq_curve: VQCurvePoint[];
  dqdv_curve: DQDVPhaseCurve | null;
}

export interface ScreeningScatterPoint {
  cell_id: string;
  channel_id: number;
  k_value_mv_day: number;
  dcir_mohm: number;
  actual_capacity_ah: number;
  grade: CellGrade;
  is_micro_short: boolean;
  is_high_dcir: boolean;
}

export interface ScreeningScatterResponse {
  k_threshold_mv_day: number;
  dcir_threshold_mohm: number;
  cells: ScreeningScatterPoint[];
}

export interface SPCPositionPoint {
  channel_id: number;
  cell_id: string;
  capacity_ah: number;
  subgroup_id: number;
}

export interface SPCSummaryResponse {
  metric_name: string;
  mean: number;
  std_dev: number;
  usl: number;
  lsl: number;
  ucl: number;
  lcl: number;
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  is_capable: boolean;
  data_points: SPCPositionPoint[];
}

export interface NovonixMetadata {
  cell_id: string;
  channel_name: string;
  protocol: string;
  total_runtime_h: number;
  total_rows: number;
  total_steps: number;
  measured_capacity_ah: number;
  nominal_capacity_ah: number;
  min_voltage_v: number;
  max_voltage_v: number;
  mean_dcir_mohm: number;
  mean_temp_c: number;
}

export interface NovonixTelemetryPoint {
  runtime_h: number;
  voltage_v: number;
  current_a: number;
  capacity_ah: number;
  temp_c: number;
  step_number: number;
}

export interface NovonixVQPoint {
  capacity_ah: number;
  voltage_v: number;
  step_type: string;
}

export interface NovonixDQDV {
  v_grid: number[];
  dqdv_smooth: number[];
  peak_v: number;
  peak_height: number;
}

export interface NovonixDCIRPulse {
  step: number;
  type: string;
  current_a: number;
  v_mean: number;
  v_start: number;
  v_end: number;
  delta_v: number;
  duration_s: number;
  dcir_mohm: number;
  temp_c: number;
}

export interface NovonixStepSummary {
  step_number: number;
  step_type: string;
  start_time_h: number;
  duration_s: number;
  avg_current_a: number;
  min_v: number;
  max_v: number;
  dcir_mohm: number | null;
  point_count: number;
}

export interface NovonixDatasetResponse {
  metadata: NovonixMetadata;
  telemetry: NovonixTelemetryPoint[];
  vq_curve: NovonixVQPoint[];
  dqdv_curve: NovonixDQDV;
  dcir_pulses: NovonixDCIRPulse[];
  steps: NovonixStepSummary[];
}



export interface NewareMetadata {
  cell_id: string;
  cycler: string;
  test_type: string;
  total_runtime_h: number;
  total_rows: number;
  total_steps: number;
  nominal_capacity_ah: number;
  measured_capacity_ah: number;
  min_voltage_v: number;
  max_voltage_v: number;
  max_discharge_current_a: number;
  mean_temp_c: number;
  time_bug_resolved: boolean;
  quarantine_events_count: number;
}

export interface NewareTelemetryPoint {
  runtime_h: number;
  voltage_v: number;
  current_a: number;
  capacity_ah: number;
  temp_c: number;
  step_index: number;
  step_type: string;
}

export interface NewareRateCurvePoint {
  capacity_ah: number;
  voltage_v: number;
  rate_label: string;
  c_rate: number;
}

export interface NewareDQDV {
  v_grid: number[];
  dqdv_smooth: number[];
  peak_v: number;
  peak_height: number;
}

export interface NewareRateRetentionPoint {
  rate_c: number;
  rate_label: string;
  current_a: number;
  capacity_ah: number;
  retention_pct: number;
  duration_min: number;
  energy_wh: number;
}

export interface NewareStepSummary {
  step_index: number;
  step_type: string;
  start_time_h: number;
  duration_s: number;
  avg_current_a: number;
  capacity_ah: number;
  min_v: number;
  max_v: number;
  point_count: number;
}

export interface NewareDatasetResponse {
  metadata: NewareMetadata;
  telemetry: NewareTelemetryPoint[];
  rate_curves: NewareRateCurvePoint[];
  dqdv_curve: NewareDQDV;
  rate_retention: NewareRateRetentionPoint[];
  steps: NewareStepSummary[];
}

export interface LfpMetadata {
  cell_id: string;
  manufacturer: string;
  positive_electrode: string;
  negative_electrode: string;
  nominal_capacity_ah: number;
  measured_capacity_ah: number;
  nominal_voltage_v: number;
  min_voltage_v: number;
  max_voltage_v: number;
  total_runtime_h: number;
  total_rows: number;
  total_steps: number;
  cell_weight_g: number;
  plateau_fraction_pct: number;
}

export interface LfpTelemetryPoint {
  runtime_h: number;
  voltage_v: number;
  current_a: number;
  capacity_ah: number;
  soc: number;
  step_type: string;
  c_rate: string;
}

export interface LfpVQPoint {
  capacity_ah: number;
  voltage_v: number;
  rate_label: string;
  step_type: string;
}

export interface LfpDQDV {
  v_grid: number[];
  charge_dqdv: number[];
  discharge_dqdv: number[];
  charge_peak_v: number;
  charge_peak_height: number;
  discharge_peak_v: number;
  discharge_peak_height: number;
  delta_v_hysteresis_mv: number;
}

export interface LfpStepSummary {
  step_index: number;
  regime?: string;
  step_name: string;
  c_rate: string;
  step_type: string;
  duration_s: number;
  duration_h?: number;
  current_a: number;
  capacity_ah: number;
  energy_wh: number;
  min_v: number;
  max_v: number;
  point_count: number;
}

export interface LfpGittPoint {
  pulse_index: number;
  soc: number;
  voltage_pulse_end: number;
  ocv_relaxed: number;
  current_a: number;
  r_internal_mohm: number;
  d_li_cm2_s: number;
}

export interface LfpGittCurvePoint {
  runtime_h: number;
  voltage_v: number;
  current_a: number;
  soc: number;
}

export interface LfpDriveProfilePoint {
  time_s: number;
  time_h: number;
  voltage_v: number;
  current_a: number;
  net_ah: number;
  soc: number;
}

export interface LfpDatasetResponse {
  metadata: LfpMetadata;
  telemetry: LfpTelemetryPoint[];
  vq_curves: LfpVQPoint[];
  dqdv_curve: LfpDQDV;
  steps: LfpStepSummary[];
  gitt_pulses?: LfpGittPoint[];
  gitt_timeline?: LfpGittCurvePoint[];
  drive_profile?: LfpDriveProfilePoint[];
}

export interface BTMSRequest {
  c_rate: number;
  ambient_temp_c: number;
  coolant_flow_lpm: number;
  duration_s?: number;
  cell_capacity_ah?: number;
}

export interface BTMSSimulationPoint {
  time_s: number;
  soc: number;
  t_core_c: number;
  t_surf_c: number;
  delta_t_c: number;
  q_joule_w: number;
  q_entropic_w: number;
  q_total_w: number;
}

export interface BTMSResponse {
  c_rate: number;
  ambient_temp_c: number;
  coolant_flow_lpm: number;
  cell_capacity_ah: number;
  duration_s: number;
  max_core_temp_c: number;
  max_surface_temp_c: number;
  max_thermal_gradient_c: number;
  is_compliant: boolean;
  time_series: BTMSSimulationPoint[];
}


