"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { ScreeningScatterPoint } from "@/types/api";

interface ScreeningChartProps {
  cells: ScreeningScatterPoint[];
  kThreshold?: number;
  dcirThreshold?: number;
  onSelectCell?: (cellId: string) => void;
  selectedCellId?: string;
}

const chartConfig = {
  gradeA: {
    label: "Grade A — Pack Véhicule Électrique (EV)",
    color: "#10b981",
  },
  gradeB: {
    label: "Grade B — Stockage Réseau (BESS)",
    color: "#f59e0b",
  },
  scrap: {
    label: "Quarantaine / Rebut (Micro-court-circuit)",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function ScreeningChart({
  cells,
  kThreshold = 0.15,
  dcirThreshold = 1.8,
  onSelectCell,
}: ScreeningChartProps) {
  if (cells.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">
        Aucune donnée de tri métrologique enregistrée.
      </div>
    );
  }

  const gradeACells = cells.filter((c) => c.grade === "Grade A");
  const gradeBCells = cells.filter((c) => c.grade === "Grade B");
  const scrapCells = cells.filter((c) => c.grade === "Scrap");

  const kMaxFromCells = cells.length > 0 ? Math.max(...cells.map((c) => c.k_value_mv_day)) : 0.3;
  const dcirMaxFromCells = cells.length > 0 ? Math.max(...cells.map((c) => c.dcir_mohm)) : 2.5;

  const maxX = Math.max(kThreshold * 1.5, kMaxFromCells * 1.25, 0.35);
  const maxY = Math.max(dcirThreshold * 1.35, dcirMaxFromCells * 1.2, 2.8);

  function handleClick(entry: unknown) {
    const item = entry as { payload?: ScreeningScatterPoint };
    if (onSelectCell && item.payload?.cell_id) {
      onSelectCell(item.payload.cell_id);
    }
  }

  const refLabelStyle = {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
  };

  return (
    <ChartContainer config={chartConfig} className="h-76 w-full">
      <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />

        <XAxis
          type="number"
          dataKey="k_value_mv_day"
          name="K-Value"
          domain={[0, maxX]}
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94a3b8" }}
          tickFormatter={(v: number) => v.toFixed(2)}
          axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          label={{
            value: "Taux d'auto-décharge — K = dV/dt (mV/jour)",
            position: "insideBottom",
            offset: -16,
            fill: "#e2e8f0",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        />

        <YAxis
          type="number"
          dataKey="dcir_mohm"
          name="DCIR"
          domain={[0, maxY]}
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#94a3b8" }}
          tickFormatter={(v: number) => (v >= 10 ? v.toFixed(0) : v.toFixed(1))}
          axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          tickLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
          width={52}
          label={{
            value: "Résistance DCIR (mΩ)",
            angle: -90,
            position: "insideLeft",
            offset: 14,
            fill: "#e2e8f0",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        />

        <Tooltip content={<ChartTooltipContent />} />

        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            paddingBottom: 12,
          }}
          formatter={(value: string) => (
            <span className="text-foreground font-medium text-xs ml-1 inline-block">
              {value}
            </span>
          )}
        />

        {/* K-value micro-short threshold */}
        <ReferenceLine
          x={kThreshold}
          stroke="#f43f5e"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{
            ...refLabelStyle,
            value: `Seuil K = ${kThreshold.toFixed(2)} mV/j`,
            fill: "#f87171",
            position: "insideTopLeft",
          }}
        />

        {/* DCIR ceiling */}
        <ReferenceLine
          y={dcirThreshold}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{
            ...refLabelStyle,
            value: `Seuil DCIR = ${dcirThreshold.toFixed(1)} mΩ`,
            fill: "#fbbf24",
            position: "insideTopRight",
          }}
        />

        {/* Grade A: High-contrast Automotive Emerald */}
        <Scatter
          name="Grade A — EV Pack"
          data={gradeACells}
          fill="#10b981"
          stroke="#047857"
          strokeWidth={1.5}
          cursor={onSelectCell ? "pointer" : undefined}
          onClick={handleClick}
          opacity={0.95}
        />

        {/* Grade B: High-contrast Amber */}
        <Scatter
          name="Grade B — Stationary ESS"
          data={gradeBCells}
          fill="#f59e0b"
          stroke="#b45309"
          strokeWidth={1.5}
          cursor={onSelectCell ? "pointer" : undefined}
          onClick={handleClick}
          opacity={0.95}
        />

        {/* Scrap: High-contrast Vibrant Red */}
        <Scatter
          name="Quarantined / Scrap"
          data={scrapCells}
          fill="#ef4444"
          stroke="#991b1b"
          strokeWidth={2}
          cursor={onSelectCell ? "pointer" : undefined}
          onClick={handleClick}
          opacity={0.95}
        />
      </ScatterChart>
    </ChartContainer>
  );
}
