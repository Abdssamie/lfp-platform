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
import type { LfpDriveProfilePoint } from "@/types/api";

interface LfpDriveProfileChartProps {
  data: LfpDriveProfilePoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: LfpDriveProfilePoint;
  }>;
  label?: number;
}

function DriveTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) return null;
  const p = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">
          Profil Dynamique VE (US06/WLTP)
        </span>
        <span className="text-muted-foreground">{Number(label).toFixed(2)} hours</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Voltage:</span>
          <span className="font-bold text-foreground">{p.voltage_v?.toFixed(4)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-semibold text-foreground">{p.current_a?.toFixed(2)} A</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Net Capacity:</span>
          <span className="font-medium text-foreground">{p.net_ah?.toFixed(2)} Ah</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">SOC:</span>
          <span className="font-medium text-foreground">{((p.soc || 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function LfpDriveProfileChart({ data }: LfpDriveProfileChartProps) {
  const [viewMode, setViewMode] = useState<"both" | "current" | "voltage">("both");

  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No EV drive cycle data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span className="text-muted-foreground">
          Cycle Routier VE Réel : <strong className="text-foreground font-semibold">5.22 Heures</strong> · Pic Décharge +47.2A · Récupération -25.3A
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
            Tension &amp; Courant
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
            Courant Transitoire I(t)
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
            Réponse en Tension V(t)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="time_h"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(1)}h`}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            {(viewMode === "both" || viewMode === "voltage") && (
              <YAxis
                yAxisId="voltage"
                domain={[3.05, 3.45]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--foreground)" }}
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
                domain={[-30, 55]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(0)}A`}
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={48}
              />
            )}
            <Tooltip content={<DriveTooltip />} />
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
                name="Tension Cellule V(t)"
                stroke="#38bdf8"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {(viewMode === "both" || viewMode === "current") && (
              <Line
                yAxisId="current"
                type="monotone"
                dataKey="current_a"
                name="Courant Transitoire I(t)"
                stroke="#f97316"
                strokeWidth={1.2}
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
