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
import type { NewareTelemetryPoint } from "@/types/api";

interface NewareTelemetryChartProps {
  data: NewareTelemetryPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: NewareTelemetryPoint;
  }>;
  label?: number;
}

function TelemetryTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">Step #{point.step_index}</span>
        <span className="text-muted-foreground">{Number(label).toFixed(2)} hours</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Cell Voltage:</span>
          <span className="font-bold text-primary">{point.voltage_v.toFixed(4)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-semibold text-foreground">{point.current_a.toFixed(2)} A</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="font-medium text-foreground">{point.capacity_ah.toFixed(3)} Ah</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Step Type:</span>
          <span className="font-medium text-primary">{point.step_type}</span>
        </div>
      </div>
    </div>
  );
}

export function NewareTelemetryChart({ data }: NewareTelemetryChartProps) {
  const [viewMode, setViewMode] = useState<"both" | "voltage" | "current">("both");

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No telemetry data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Spacious Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          Continuous Ingestion:{" "}
          <strong className="text-foreground font-semibold">34.9 Hours</strong> (Sanitized Monotonic Time)
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
            Voltage &amp; Current
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
            Voltage Only
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
            Current Only
          </button>
        </div>
      </div>

      {/* Spacious Chart */}
      <div className="w-full h-96 min-w-0">
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
                domain={[2.8, 4.45]}
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
                domain={[-65, 10]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(0)}A`}
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={46}
              />
            )}
            <Tooltip content={<TelemetryTooltip />} />
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
                name="Cell Potential (V)"
                stroke="var(--primary)"
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
                name="Current (A)"
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
