"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { DQDVPhaseCurve } from "@/types/api";

interface DQDVChartProps {
  data: DQDVPhaseCurve | null;
}

const chartConfig = {
  dqdv: {
    label: "dQ/dV (Ah/V)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DQDVChart({ data }: DQDVChartProps) {
  if (!data || data.v_grid.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">
        No dQ/dV phase transition curve available.
      </div>
    );
  }

  const chartData = data.v_grid.map((v, idx) => ({
    voltage: v,
    dqdv: data.dqdv_smooth[idx] ?? 0,
  }));

  const primaryPeak = data.peaks[0] ?? null;

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <LineChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" strokeOpacity={0.7} />
        <XAxis
          dataKey="voltage"
          type="number"
          domain={[3.25, 3.55]}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `${v.toFixed(3)} V`}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => v.toFixed(1)}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<ChartTooltipContent />} />
        {primaryPeak && (
          <ReferenceLine
            x={primaryPeak.peak_voltage_v}
            stroke="var(--chart-1)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            opacity={0.7}
            label={{
              value: `${primaryPeak.peak_voltage_v.toFixed(3)} V`,
              fill: "var(--chart-1)",
              fontSize: 10,
              position: "insideTopRight",
              fontFamily: "var(--font-mono)",
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="dqdv"
          name="dQ/dV (Ah/V)"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
