"use client";

import * as React from "react";
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Play,
  Thermometer,
  Layers,
  Clock,
  Table as TableIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { simulateBTMS } from "@/lib/api";
import { solveBTMSSimulation } from "@/lib/btms-solver";
import type { BTMSResponse, BTMSRequest } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";
import { useTour } from "@/components/guided-tour/tour-context";

const DEFAULT_SIMULATION: BTMSResponse = solveBTMSSimulation({
  c_rate: 2.0,
  ambient_temp_c: 25.0,
  coolant_flow_lpm: 4.0,
  cell_capacity_ah: 50.0,
});

export function BTMSPanel() {
  const { t, isFr } = usePlatformTranslation();
  const { isTourRunning, tourStepIndex, setTourStepIndex } = useTour();
  const [cRate, setCRate] = React.useState<number>(2.0);
  const [ambientTemp, setAmbientTemp] = React.useState<number>(25.0);
  const [coolantFlow, setCoolantFlow] = React.useState<number>(4.0);
  const [cellCapacity, setCellCapacity] = React.useState<number>(50.0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<BTMSResponse | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleRunSimulation = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const req: BTMSRequest = {
        c_rate: Number(cRate),
        ambient_temp_c: Number(ambientTemp),
        coolant_flow_lpm: Number(coolantFlow),
        cell_capacity_ah: Number(cellCapacity),
      };
      const result = await simulateBTMS(req);
      setData(result);
      if (isTourRunning && tourStepIndex === 1) {
        setTourStepIndex(2);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "BTMS simulation request failed";
      const cleanMsg = msg.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
      setErrorMsg(cleanMsg);
      setData(DEFAULT_SIMULATION);
      if (isTourRunning && tourStepIndex === 1) {
        setTourStepIndex(2);
      }
    } finally {
      setLoading(false);
    }
  }, [cRate, ambientTemp, coolantFlow, cellCapacity, isTourRunning, tourStepIndex, setTourStepIndex]);

  return (
    <div className="space-y-6">
      {/* Simulation Controls & Parameters */}
      <Card data-tour="btms-controls">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="size-4 text-foreground" />
            <span>{t.btms.controlsTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t.btms.controlsDesc}
          </CardDescription>
          <CardAction>
            <Button
              size="sm"
              onClick={handleRunSimulation}
              disabled={loading}
              data-tour="btms-run-btn"
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Play className="size-3.5 fill-current" />
              {loading ? t.btms.solvingODE : t.btms.runSimulation}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{t.btms.cRateLabel}</span>
                <span className="font-mono text-foreground font-semibold">{cRate}C</span>
              </Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="5.0"
                value={cRate}
                onChange={(e) => setCRate(parseFloat(e.target.value) || 1.0)}
                className="font-mono text-xs h-8"
              />
              <span className="text-[10px] text-muted-foreground">{t.btms.cRateRange}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{t.btms.coolantTempLabel}</span>
                <span className="font-mono text-foreground font-semibold">{ambientTemp}&deg;C</span>
              </Label>
              <Input
                type="number"
                step="1"
                min="-10"
                max="50"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseFloat(e.target.value) || 25.0)}
                className="font-mono text-xs h-8"
              />
              <span className="text-[10px] text-muted-foreground">{t.btms.coldPlateInlet}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{t.btms.flowRateLabel}</span>
                <span className="font-mono text-foreground font-semibold">{coolantFlow} LPM</span>
              </Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="15.0"
                value={coolantFlow}
                onChange={(e) => setCoolantFlow(parseFloat(e.target.value) || 4.0)}
                className="font-mono text-xs h-8"
              />
              <span className="text-[10px] text-muted-foreground">{t.btms.coolantFluid}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{t.btms.nominalCapacityLabel}</span>
                <span className="font-mono text-foreground font-semibold">{cellCapacity} Ah</span>
              </Label>
              <Input
                type="number"
                step="5"
                min="10"
                max="200"
                value={cellCapacity}
                onChange={(e) => setCellCapacity(parseFloat(e.target.value) || 50.0)}
                className="font-mono text-xs h-8"
              />
              <span className="text-[10px] text-muted-foreground">{t.btms.prismaticCell}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMsg} ({isFr ? "Utilisation des données pré-calculées RK45" : "Using pre-calculated RK45 data"})</span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && !data && (
        <div className="rounded-xl border border-border/60 bg-card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {isFr ? "Résolution du modèle SciPy RK45 en cours..." : "Solving SciPy RK45 ODE Model..."}
            </h4>
            <p className="text-xs text-muted-foreground font-mono max-w-md">
              {isFr
                ? "Intégration du bilan de Bernardi, pertes Joule I²R et convection forcée Dittus-Boelter (Eau-Glycol 50/50)..."
                : "Integrating Bernardi heat generation, Joule I²R dissipation and Dittus-Boelter forced convection (50/50 Water-Glycol)..."}
            </p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Compliance Metrics Strip */}
          <div data-tour="btms-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{t.btms.saeStatus}</span>
            <ShieldCheck className="size-3.5 text-foreground" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold">
              {data.is_compliant ? t.common.compliant.toUpperCase() : t.common.nonCompliant.toUpperCase()}
            </span>
            <Badge
              variant="outline"
              className="text-xs"
            >
              {data.is_compliant ? (isFr ? "Conforme" : "Pass") : (isFr ? "Échec" : "Fail")}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">
            {t.btms.saeRule}
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{t.btms.maxThermalGradient}</span>
            <Thermometer className="size-3.5 text-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-foreground">
              {data.max_thermal_gradient_c.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">&deg;C</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">
            {t.btms.gradientFormula}
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{t.btms.peakCoreTemp}</span>
            <Flame className="size-3.5 text-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-foreground">
              {data.max_core_temp_c.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">&deg;C</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">
            {t.btms.hotspotCenter}
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{t.btms.surfacePlateTemp}</span>
            <Thermometer className="size-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-foreground">
              {data.max_surface_temp_c.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">&deg;C</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">
            {t.btms.heatExchangeInterface}
          </span>
        </Card>
      </div>

      {/* 1. DATA TABLE FIRST THING SHOWN */}
      <div data-tour="btms-table" className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <TableIcon className="size-4 text-primary" />
              {t.btms.tableTitle}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none">
              {t.btms.tableDesc}
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono gap-1 shrink-0">
            <Clock className="size-3" />
            {data.time_series.length} {t.btms.sampledPoints}
          </Badge>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[360px] overflow-y-auto overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="text-xs">
                <TableHead className="font-mono">{t.btms.thTime}</TableHead>
                <TableHead className="font-mono">{t.btms.thSoc}</TableHead>
                <TableHead className="font-mono">{t.btms.thTCore}</TableHead>
                <TableHead className="font-mono">{t.btms.thTSurf}</TableHead>
                <TableHead className="font-mono hidden sm:table-cell">{t.btms.thDeltaT}</TableHead>
                <TableHead className="font-mono hidden md:table-cell">{t.btms.thJouleLosses}</TableHead>
                <TableHead className="font-mono hidden md:table-cell">{t.btms.thEntropicFlux}</TableHead>
                <TableHead className="font-mono hidden sm:table-cell">{t.btms.thTotalFlux}</TableHead>
                <TableHead className="font-mono hidden lg:table-cell">{t.btms.thCompliance}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs font-mono">
              {data.time_series.map((row) => (
                <TableRow key={row.time_s} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{row.time_s}s</TableCell>
                  <TableCell>{(row.soc * 100).toFixed(1)}%</TableCell>
                  <TableCell className="font-semibold">{row.t_core_c.toFixed(2)}°C</TableCell>
                  <TableCell>{row.t_surf_c.toFixed(2)}°C</TableCell>
                  <TableCell className="font-semibold hidden sm:table-cell">{row.delta_t_c.toFixed(2)}°C</TableCell>
                  <TableCell className="hidden md:table-cell">{row.q_joule_w.toFixed(2)} W</TableCell>
                  <TableCell className="hidden md:table-cell">{row.q_entropic_w.toFixed(2)} W</TableCell>
                  <TableCell className="font-semibold hidden sm:table-cell">{row.q_total_w.toFixed(2)} W</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-border bg-muted/60 text-foreground">
                      {t.btms.saeCompliant}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 2. GRAPHS AND THEIR ANALYSIS WELL CLEARED */}
      <div data-tour="btms-charts" className="space-y-4 pt-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t.btms.chartSectionTitle}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t.btms.chartSectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Temperature Curves */}
          <div className="space-y-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Thermometer className="size-4 text-foreground" />
                  <span>{t.btms.tempChartTitle}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.btms.tempChartDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.time_series} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />
                    <XAxis
                      dataKey="time_s"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) => `${v}s`}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) => `${v.toFixed(0)}°C`}
                      domain={["auto", "auto"]}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-md text-xs space-y-1">
                            <p className="font-mono text-muted-foreground">
                              {isFr ? "Temps" : "Time"}: {label}s
                            </p>
                            {payload.map((p) => (
                              <div key={p.dataKey as string} className="flex items-center justify-between gap-3">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="font-mono font-medium">{Number(p.value).toFixed(2)} °C</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Line
                      type="monotone"
                      dataKey="t_core_c"
                      name={isFr ? "T_cœur (Cœur)" : "T_core (Core)"}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="t_surf_c"
                      name={isFr ? "T_surface (Contact)" : "T_surface (Contact)"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="delta_t_c"
                      name={isFr ? "Gradient (ΔT)" : "Gradient (ΔT)"}
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bernardi Heat Generation Breakdown */}
          <div className="space-y-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="size-4 text-foreground" />
                  <span>{t.btms.fluxChartTitle}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.btms.fluxChartDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.time_series} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />
                    <XAxis
                      dataKey="time_s"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) => `${v}s`}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) => `${v.toFixed(0)}W`}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-md text-xs space-y-1">
                            <p className="font-mono text-muted-foreground">
                              {isFr ? "Temps" : "Time"}: {label}s
                            </p>
                            {payload.map((p) => (
                              <div key={p.dataKey as string} className="flex items-center justify-between gap-3">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="font-mono font-medium">{Number(p.value).toFixed(2)} W</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="q_joule_w"
                      name={isFr ? "Pertes Joule (Q_joule)" : "Joule Heat (Q_joule)"}
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="q_entropic_w"
                      name={isFr ? "Flux Entropique (Q_entropic)" : "Entropic Heat (Q_entropic)"}
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                    />
                    <Line
                      type="monotone"
                      dataKey="q_total_w"
                      name={isFr ? "Flux Total (Q_total)" : "Total Flux (Q_total)"}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
