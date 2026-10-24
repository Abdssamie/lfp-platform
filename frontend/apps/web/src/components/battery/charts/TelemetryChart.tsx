"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { TelemetryPoint } from "@/types/api";

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

const chartConfig = {
  voltage_v: {
    label: "Voltage (V)",
    color: "var(--chart-1)",
  },
  current_a: {
    label: "Current (A)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function TelemetryChart({ data }: TelemetryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">
        No cycler telemetry for this channel.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" strokeOpacity={0.7} />
        <XAxis
          dataKey="timestamp_min"
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `${Math.round(v)}m`}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="voltage"
          domain={[2.3, 3.8]}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--chart-1)" }}
          tickFormatter={(v: number) => `${v.toFixed(1)}V`}
          orientation="left"
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <YAxis
          yAxisId="current"
          domain={[-12, 3]}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--chart-3)" }}
          tickFormatter={(v: number) => `${v.toFixed(0)}A`}
          orientation="right"
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", paddingBottom: 4 }}
        />
        <Line
          yAxisId="voltage"
          type="monotone"
          dataKey="voltage_v"
          name="Voltage (V)"
          stroke="var(--chart-1)"
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="current"
          type="stepAfter"
          dataKey="current_a"
          name="Current (A)"
          stroke="var(--chart-3)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
