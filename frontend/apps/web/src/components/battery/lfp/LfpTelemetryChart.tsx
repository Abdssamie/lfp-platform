"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { LfpTelemetryPoint } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";

interface LfpTelemetryChartProps {
  data: LfpTelemetryPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: LfpTelemetryPoint;
  }>;
  label?: number;
  isFr?: boolean;
}

function TelemetryTooltip({ active, payload, label, isFr }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">
          {point.step_type || "Cycle"} ({point.c_rate || "C/12"})
        </span>
        <span className="text-muted-foreground">{Number(label).toFixed(2)} {isFr ? "heures" : "hours"}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{isFr ? "Tension :" : "Voltage:"}</span>
          <span className="font-bold text-primary">
            {typeof point.voltage_v === "number" ? `${point.voltage_v.toFixed(4)} V` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{isFr ? "Courant :" : "Current:"}</span>
          <span className="font-semibold text-foreground">
            {typeof point.current_a === "number" ? `${point.current_a.toFixed(2)} A` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{isFr ? "Capacité :" : "Capacity:"}</span>
          <span className="font-medium text-foreground">
            {typeof point.capacity_ah === "number" ? `${point.capacity_ah.toFixed(2)} Ah` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">SOC:</span>
          <span className="font-medium text-foreground">
            {typeof point.soc === "number" ? `${(point.soc * 100).toFixed(1)}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LfpTelemetryChart({ data }: LfpTelemetryChartProps) {
  const { isFr } = usePlatformTranslation();
  const [viewMode, setViewMode] = useState<"both" | "voltage" | "current">("both");

  if (data.length === 0) {
    return (
      <div className="flex h-56 sm:h-72 lg:h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        {isFr ? "Aucune donnée de télémétrie disponible." : "No telemetry data available."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          {isFr ? (
            <>Cycle C/12 complet : <strong className="text-foreground font-semibold">24.5 Heures</strong> (50.0 Ah délivrés)</>
          ) : (
            <>C/12 Full Cycle: <strong className="text-foreground font-semibold">24.5 Hours</strong> (50.0 Ah Delivered)</>
          )}
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
            {isFr ? "Tension & Courant" : "Voltage & Current"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("voltage")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "voltage"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Tension" : "Voltage"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("current")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "current"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFr ? "Courant" : "Current"}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-56 sm:h-72 lg:h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="runtime_h"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(0)}h`}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            {(viewMode === "both" || viewMode === "voltage") && (
              <YAxis
                yAxisId="voltage"
                domain={[2.4, 3.7]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--primary)" }}
                tickFormatter={(v: number) => `${v.toFixed(2)}V`}
                orientation="left"
                axisLine={false}
                tickLine={false}
                width={50}
              />
            )}
            {(viewMode === "both" || viewMode === "current") && (
              <YAxis
                yAxisId="current"
                domain={[-6, 6]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(0)}A`}
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={42}
              />
            )}
            <Tooltip content={<TelemetryTooltip isFr={isFr} />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                paddingBottom: 8,
              }}
            />
            {(viewMode === "both" || viewMode === "voltage") && (
              <Line
                yAxisId="voltage"
                type="monotone"
                dataKey="voltage_v"
                name={isFr ? "Tension (V)" : "Potential (V)"}
                stroke="#10b981"
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {(viewMode === "both" || viewMode === "current") && (
              <Line
                yAxisId="current"
                type="stepAfter"
                dataKey="current_a"
                name={isFr ? "Courant (A)" : "Current (A)"}
                stroke="var(--muted-foreground)"
                strokeWidth={1.2}
                strokeDasharray="4 2"
                strokeOpacity={viewMode === "both" ? 0.45 : 1}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
