"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { VQCurvePoint } from "@/types/api";

interface VQChartProps {
  data: VQCurvePoint[];
}

const chartConfig = {
  charge_voltage: {
    label: "Charge (C/3 + CV)",
    color: "var(--chart-1)",
  },
  discharge_voltage: {
    label: "Discharge (1C)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function VQChart({ data }: VQChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">
        No V-Q curve data recorded.
      </div>
    );
  }

  const merged = data.map((p) => ({
    capacity_ah: p.capacity_ah,
    charge_voltage:
      p.step_type.includes("CHG") && !p.step_type.includes("DCHG")
        ? p.voltage_v
        : undefined,
    discharge_voltage: p.step_type.includes("DCHG") ? p.voltage_v : undefined,
  }));

  const maxCap = Math.max(...data.map((d) => d.capacity_ah), 3.3);

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <LineChart data={merged} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" strokeOpacity={0.7} />
        <XAxis
          dataKey="capacity_ah"
          type="number"
          domain={[0, maxCap]}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `${v.toFixed(2)} Ah`}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          domain={[2.4, 3.7]}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => `${v.toFixed(2)} V`}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", paddingBottom: 4 }}
        />
        <Line
          type="monotone"
          dataKey="charge_voltage"
          name="Charge (C/3 + CV)"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="discharge_voltage"
          name="Discharge (1C)"
          stroke="var(--chart-2)"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
