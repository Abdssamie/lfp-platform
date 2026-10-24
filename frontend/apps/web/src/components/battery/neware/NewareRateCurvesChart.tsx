"use client";

import { useMemo, useState } from "react";
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
import type { NewareRateCurvePoint } from "@/types/api";

interface NewareRateCurvesChartProps {
  data: NewareRateCurvePoint[];
}

interface MultiRatePoint {
  capacity_ah: number;
  c01?: number;
  c1?: number;
  c2?: number;
  c5?: number;
  c9?: number;
}

const RATE_CONFIGS = [
  { key: "c01", label: "0.1C (0.65A)", color: "#10b981", strokeWidth: 2.2 },
  { key: "c1", label: "1.0C (6.55A)", color: "#06b6d4", strokeWidth: 2.2 },
  { key: "c2", label: "2.0C (13.1A)", color: "#3b82f6", strokeWidth: 2.2 },
  { key: "c5", label: "5.0C (32.8A)", color: "#f59e0b", strokeWidth: 2.2 },
  { key: "c9", label: "9.0C (59.5A)", color: "#f43f5e", strokeWidth: 2.5 },
] as const;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: number;
}

function RateCurvesTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm min-w-48">
      <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">Discharge Capacity</span>
        <span className="text-primary font-bold">{Number(label).toFixed(2)} Ah</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="font-bold text-foreground font-mono">
              {item.value ? `${item.value.toFixed(3)} V` : "Cutoff reached"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewareRateCurvesChart({ data }: NewareRateCurvesChartProps) {
  const [activeCurves, setActiveCurves] = useState<Record<string, boolean>>({
    c01: true,
    c1: true,
    c2: true,
    c5: true,
    c9: true,
  });

  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Group raw points by rate
    const points01 = data.filter((p) => p.c_rate === 0.1).sort((a, b) => a.capacity_ah - b.capacity_ah);
    const points1 = data.filter((p) => p.c_rate === 1.0).sort((a, b) => a.capacity_ah - b.capacity_ah);
    const points2 = data.filter((p) => p.c_rate === 2.0).sort((a, b) => a.capacity_ah - b.capacity_ah);
    const points5 = data.filter((p) => p.c_rate === 5.0).sort((a, b) => a.capacity_ah - b.capacity_ah);
    const points9 = data.filter((p) => p.c_rate === 9.0).sort((a, b) => a.capacity_ah - b.capacity_ah);

    const interpolate = (pts: NewareRateCurvePoint[], cap: number): number | undefined => {
      if (pts.length === 0) return undefined;
      if (cap < pts[0].capacity_ah) return pts[0].voltage_v;
      if (cap > pts[pts.length - 1].capacity_ah) return undefined; // cutoff reached

      for (let i = 0; i < pts.length - 1; i++) {
        if (cap >= pts[i].capacity_ah && cap <= pts[i + 1].capacity_ah) {
          const deltaC = pts[i + 1].capacity_ah - pts[i].capacity_ah;
          if (deltaC <= 0.0001) return pts[i].voltage_v;
          const ratio = (cap - pts[i].capacity_ah) / deltaC;
          return pts[i].voltage_v + ratio * (pts[i + 1].voltage_v - pts[i].voltage_v);
        }
      }
      return pts[pts.length - 1].voltage_v;
    };

    // Build common capacity grid from 0 to 7.30 Ah with 0.1 Ah steps
    const grid: MultiRatePoint[] = [];
    const maxCap = 7.28;
    const steps = 73; // 0.1 Ah steps

    for (let s = 0; s <= steps; s++) {
      const cap = Number(((s / steps) * maxCap).toFixed(2));
      grid.push({
        capacity_ah: cap,
        c01: interpolate(points01, cap),
        c1: interpolate(points1, cap),
        c2: interpolate(points2, cap),
        c5: interpolate(points5, cap),
        c9: interpolate(points9, cap),
      });
    }

    return grid;
  }, [data]);

  const toggleCurve = (key: string) => {
    setActiveCurves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No rate capability curves available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Rate Toggle Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <span className="text-muted-foreground">
          Overpotential &amp; Rate Capability (0.1C to 9.0C)
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {RATE_CONFIGS.map((cfg) => {
            const isActive = activeCurves[cfg.key];
            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => toggleCurve(cfg.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                  isActive
                    ? "bg-muted/80 text-foreground border-border shadow-2xs font-medium"
                    : "bg-transparent text-muted-foreground/60 border-border/40 line-through opacity-60"
                }`}
              >
                <span
                  className="size-2 rounded-full inline-block"
                  style={{ backgroundColor: cfg.color }}
                />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Chart Area */}
      <div className="w-full h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="capacity_ah"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(1)} Ah`}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[2.9, 4.4]}
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--primary)" }}
              tickFormatter={(v: number) => `${v.toFixed(2)}V`}
              orientation="left"
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<RateCurvesTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                paddingBottom: 8,
              }}
            />

            {RATE_CONFIGS.map((cfg) => {
              if (!activeCurves[cfg.key]) return null;
              return (
                <Line
                  key={cfg.key}
                  type="monotone"
                  dataKey={cfg.key}
                  name={cfg.label}
                  stroke={cfg.color}
                  strokeWidth={cfg.strokeWidth}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
