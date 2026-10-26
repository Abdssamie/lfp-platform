"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { SPCSummaryResponse } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";

interface SPCChartProps {
  summary: SPCSummaryResponse | null;
  onSelectCell?: (cellId: string) => void;
}

export function SPCChart({ summary }: SPCChartProps) {
  const { t, isFr } = usePlatformTranslation();

  const dynamicChartConfig = {
    capacity_ah: {
      label: t.formation.spcCapacityAxisLabel,
      color: "#38bdf8",
    },
  } satisfies ChartConfig;

  if (!summary || summary.data_points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">
        {isFr ? "Aucune série temporelle SPC calculée." : "No SPC time-series data calculated."}
      </div>
    );
  }

  const { mean, usl, lsl, ucl, lcl, data_points } = summary;
  const yMin = Math.min(lsl - 0.05, lcl - 0.02);
  const yMax = Math.max(usl + 0.05, ucl + 0.02);

  const refLabelStyle = {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
  };

  return (
    <ChartContainer config={dynamicChartConfig} className="h-56 sm:h-72 lg:h-76 w-full">
      <LineChart data={data_points} margin={{ top: 20, right: 75, left: 4, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />

        <XAxis
          dataKey="channel_id"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94a3b8" }}
          tickFormatter={(v: number) => `CH${v.toString().padStart(2, "0")}`}
          axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          label={{
            value: t.formation.spcChannelAxisLabel,
            position: "insideBottom",
            offset: -12,
            fill: "#e2e8f0",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        />

        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94a3b8" }}
          tickFormatter={(v: number) => v.toFixed(2)}
          axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          width={54}
          label={{
            value: t.formation.spcCapacityAxisLabel,
            angle: -90,
            position: "insideLeft",
            offset: 14,
            fill: "#e2e8f0",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        />

        <Tooltip content={<ChartTooltipContent />} />

        {/* Grand mean (Center line) */}
        <ReferenceLine
          y={mean}
          stroke="#10b981"
          strokeWidth={1.8}
          label={{ ...refLabelStyle, value: `X̄ ${mean.toFixed(3)}`, fill: "#34d399", position: "right" }}
        />

        {/* Control limits ±3σ (UCL / LCL) */}
        <ReferenceLine
          y={ucl}
          stroke="#38bdf8"
          strokeDasharray="4 3"
          strokeWidth={1.4}
          label={{ ...refLabelStyle, value: `UCL ${ucl.toFixed(3)}`, fill: "#38bdf8", position: "right" }}
        />
        <ReferenceLine
          y={lcl}
          stroke="#38bdf8"
          strokeDasharray="4 3"
          strokeWidth={1.4}
          label={{ ...refLabelStyle, value: `LCL ${lcl.toFixed(3)}`, fill: "#38bdf8", position: "right" }}
        />

        {/* Spec limits (USL / LSL) */}
        <ReferenceLine
          y={usl}
          stroke="#ef4444"
          strokeDasharray="2 3"
          strokeWidth={1.2}
          opacity={0.85}
          label={{ ...refLabelStyle, value: `USL ${usl.toFixed(2)}`, fill: "#f87171", position: "right" }}
        />
        <ReferenceLine
          y={lsl}
          stroke="#ef4444"
          strokeDasharray="2 3"
          strokeWidth={1.2}
          opacity={0.85}
          label={{ ...refLabelStyle, value: `LSL ${lsl.toFixed(2)}`, fill: "#f87171", position: "right" }}
        />

        <Line
          type="monotone"
          dataKey="capacity_ah"
          name={t.formation.spcCapacityAxisLabel}
          stroke="#f8fafc"
          strokeWidth={2}
          dot={{ r: 4, fill: "#38bdf8", stroke: "#0f172a", strokeWidth: 1.5 }}
          activeDot={{ r: 6, stroke: "#38bdf8", strokeWidth: 2, fill: "#ffffff" }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
