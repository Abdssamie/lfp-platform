"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { NovonixDQDV } from "@/types/api";

interface NovonixDQDVChartProps {
  data: NovonixDQDV | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { voltage_v: number; dqdv: number };
  }>;
  label?: number;
}

function DQDVTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-primary">Differential Capacity</span>
        <span className="text-muted-foreground">{Number(label).toFixed(3)} V</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-muted-foreground">dQ/dV Intensity:</span>
        <span className="font-bold text-foreground">{point.dqdv.toFixed(2)} Ah/V</span>
      </div>
    </div>
  );
}

export function NovonixDQDVChart({ data }: NovonixDQDVChartProps) {
  if (!data || data.v_grid.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No dQ/dV phase curve available.
      </div>
    );
  }

  const chartData = data.v_grid.map((v, i) => ({
    voltage_v: v,
    dqdv: Math.max(0, data.dqdv_smooth[i] ?? 0),
  }));

  return (
    <div className="w-full h-96 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={chartData} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
          <defs>
            <linearGradient id="dqdvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
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
            width={48}
          />
          <Tooltip content={<DQDVTooltip />} />
          <ReferenceLine
            x={data.peak_v}
            stroke="var(--primary)"
            strokeDasharray="4 4"
            strokeWidth={1.8}
            label={{
              value: `Peak: ${data.peak_v.toFixed(3)}V (${data.peak_height.toFixed(1)} Ah/V)`,
              position: "top",
              fill: "var(--primary)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
            }}
          />
          <Area
            type="monotone"
            dataKey="dqdv"
            name="dQ/dV (Ah/V)"
            stroke="var(--primary)"
            strokeWidth={2.4}
            fill="url(#dqdvGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
