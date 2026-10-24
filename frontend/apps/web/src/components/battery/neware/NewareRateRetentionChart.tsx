"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { NewareRateRetentionPoint } from "@/types/api";

interface NewareRateRetentionChartProps {
  data: NewareRateRetentionPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: NewareRateRetentionPoint;
  }>;
}

function RetentionTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">{p.rate_label}</span>
        <span className="text-primary font-bold">{p.retention_pct.toFixed(2)}% Retention</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Discharge Current:</span>
          <span className="font-semibold text-foreground">{p.current_a.toFixed(2)} A</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Delivered Capacity:</span>
          <span className="font-bold text-primary">{p.capacity_ah.toFixed(3)} Ah</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Delivered Energy:</span>
          <span className="font-medium text-foreground">{p.energy_wh.toFixed(2)} Wh</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Discharge Time:</span>
          <span className="font-medium text-muted-foreground">{p.duration_min.toFixed(1)} min</span>
        </div>
      </div>
    </div>
  );
}

const BAR_COLORS = ["#10b981", "#06b6d4", "#3b82f6", "#f59e0b", "#f43f5e"];

export function NewareRateRetentionChart({ data }: NewareRateRetentionChartProps) {
  const [metricMode, setMetricMode] = useState<"retention" | "energy">("retention");

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No rate retention data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          Capacity Degradation under High Discharge Currents
        </span>

        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setMetricMode("retention")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              metricMode === "retention"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Capacity Retention (%)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("energy")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              metricMode === "energy"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Delivered Energy (Wh)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="rate_label"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={metricMode === "retention" ? [95, 101] : [24, 30]}
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) =>
                metricMode === "retention" ? `${v.toFixed(0)}%` : `${v.toFixed(0)}Wh`
              }
              orientation="left"
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<RetentionTooltip />} />
            <Bar
              dataKey={metricMode === "retention" ? "retention_pct" : "energy_wh"}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rate Matrix Readout Table */}
      <div className="border border-border/80 rounded-md overflow-hidden bg-card/20 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="py-1.5 px-3">C-Rate</th>
              <th className="py-1.5 px-3 text-right">Current</th>
              <th className="py-1.5 px-3 text-right">Capacity</th>
              <th className="py-1.5 px-3 text-right">Retention</th>
              <th className="py-1.5 px-3 text-right">Energy</th>
              <th className="py-1.5 px-3 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((r, i) => (
              <tr key={r.rate_label} className="hover:bg-muted/30 transition-colors">
                <td className="py-1.5 px-3 font-semibold flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full inline-block"
                    style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                  />
                  <span>{r.rate_label}</span>
                </td>
                <td className="py-1.5 px-3 text-right text-muted-foreground">
                  {r.current_a.toFixed(1)} A
                </td>
                <td className="py-1.5 px-3 text-right font-medium text-foreground">
                  {r.capacity_ah.toFixed(3)} Ah
                </td>
                <td className="py-1.5 px-3 text-right font-bold text-primary">
                  {r.retention_pct.toFixed(2)}%
                </td>
                <td className="py-1.5 px-3 text-right text-foreground">
                  {r.energy_wh.toFixed(2)} Wh
                </td>
                <td className="py-1.5 px-3 text-right text-muted-foreground">
                  {r.duration_min >= 60
                    ? `${(r.duration_min / 60).toFixed(1)} h`
                    : `${r.duration_min.toFixed(1)} min`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
