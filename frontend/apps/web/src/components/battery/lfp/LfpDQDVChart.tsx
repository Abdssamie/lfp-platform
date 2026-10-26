"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { LfpDQDV } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";

interface LfpDQDVChartProps {
  data: LfpDQDV | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: number;
  isFr?: boolean;
}

function DQDVTooltip({ active, payload, label, isFr }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">{isFr ? "Potentiel Cellule" : "Cell Potential"}</span>
        <span className="text-muted-foreground">{Number(label).toFixed(4)} V</span>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-bold text-foreground font-mono">
              {typeof item.value === "number" ? `${item.value.toFixed(1)} Ah/V` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LfpDQDVChart({ data }: LfpDQDVChartProps) {
  const { isFr } = usePlatformTranslation();
  const [viewMode, setViewMode] = useState<"both" | "charge" | "discharge">("both");

  if (!data || data.v_grid.length === 0) {
    return (
      <div className="flex h-56 sm:h-72 lg:h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        {isFr ? "Aucune courbe dQ/dV disponible." : "No dQ/dV phase curve available."}
      </div>
    );
  }

  const chartData = data.v_grid.map((v, i) => ({
    voltage_v: v,
    charge_dqdv: Math.max(0, data.charge_dqdv[i] ?? 0),
    discharge_dqdv: Math.max(0, data.discharge_dqdv[i] ?? 0),
  }));

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          {isFr ? "Pics Redox :" : "Phase Peak:"} <strong className="text-foreground">{data.charge_peak_v.toFixed(3)}V ({isFr ? "Chg" : "Chg"})</strong> / <strong className="text-foreground">{data.discharge_peak_v.toFixed(3)}V ({isFr ? "Dchg" : "Dchg"})</strong> · {isFr ? "Hystérèse :" : "Hysteresis:"} <strong className="text-foreground font-semibold">{data.delta_v_hysteresis_mv.toFixed(1)} mV</strong>
        </span>

        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "both"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Les Deux" : "Both Peaks"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("charge")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "charge"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Charge" : "Charge Peak"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("discharge")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "discharge"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Décharge" : "Discharge Peak"}
          </button>
        </div>
      </div>

      {/* Spacious Chart Area */}
      <div className="w-full h-56 sm:h-72 lg:h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <defs>
              <linearGradient id="lfpChargeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lfpDischargeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="voltage_v"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(2)}V`}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(0)}`}
              orientation="left"
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<DQDVTooltip isFr={isFr} />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                paddingBottom: 8,
              }}
            />
            {(viewMode === "both" || viewMode === "charge") && (
              <ReferenceLine
                x={data.charge_peak_v}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${isFr ? "Chg" : "Chg"}: ${data.charge_peak_v.toFixed(3)}V`,
                  position: "top",
                  fill: "#10b981",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
              />
            )}
            {(viewMode === "both" || viewMode === "discharge") && (
              <ReferenceLine
                x={data.discharge_peak_v}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${isFr ? "Dchg" : "Dchg"}: ${data.discharge_peak_v.toFixed(3)}V`,
                  position: "insideTopLeft",
                  fill: "#06b6d4",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
              />
            )}
            {(viewMode === "both" || viewMode === "charge") && (
              <Area
                type="monotone"
                dataKey="charge_dqdv"
                name={isFr ? "dQ/dV Charge" : "Charge dQ/dV"}
                stroke="#10b981"
                strokeWidth={2.4}
                fill="url(#lfpChargeGradient)"
                isAnimationActive={false}
              />
            )}
            {(viewMode === "both" || viewMode === "discharge") && (
              <Area
                type="monotone"
                dataKey="discharge_dqdv"
                name={isFr ? "dQ/dV Décharge" : "Discharge dQ/dV"}
                stroke="#06b6d4"
                strokeWidth={2.4}
                fill="url(#lfpDischargeGradient)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
