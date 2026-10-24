"use client";

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
import type { NovonixVQPoint } from "@/types/api";

interface NovonixVQChartProps {
  data: NovonixVQPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: NovonixVQPoint;
  }>;
  label?: number;
}

function VQTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-primary">{point.step_type}</span>
        <span className="text-muted-foreground">{Number(label).toFixed(3)} Ah</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-muted-foreground">Cell Potential:</span>
        <span className="font-bold text-foreground">{point.voltage_v.toFixed(4)} V</span>
      </div>
    </div>
  );
}

export function NovonixVQChart({ data }: NovonixVQChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No V-Q curve data available.
      </div>
    );
  }

  return (
    <div className="w-full h-96 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="capacity_ah"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => `${v.toFixed(1)} Ah`}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[2.95, 4.4]}
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--primary)" }}
            tickFormatter={(v: number) => `${v.toFixed(2)}V`}
            orientation="left"
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<VQTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              paddingBottom: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey="voltage_v"
            name="Potential (V)"
            stroke="var(--primary)"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
