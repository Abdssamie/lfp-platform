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
  ReferenceArea,
} from "recharts";
import type { LfpVQPoint } from "@/types/api";

interface LfpVQChartProps {
  data: LfpVQPoint[];
}

interface MergedVQPoint {
  capacity_ah: number;
  v_charge?: number;
  v_discharge?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value?: number;
    color: string;
    payload: MergedVQPoint;
  }>;
  label?: number | string;
}

function VQTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  const vChg = typeof point?.v_charge === "number" ? point.v_charge : null;
  const vDchg = typeof point?.v_discharge === "number" ? point.v_discharge : null;
  const deltaV = vChg !== null && vDchg !== null ? (vChg - vDchg) * 1000 : null;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm min-w-52">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">LiFePO4 Potential</span>
        <span className="text-muted-foreground">{Number(label).toFixed(2)} Ah</span>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="font-bold text-foreground font-mono">
              {typeof item.value === "number" ? `${item.value.toFixed(4)} V` : "—"}
            </span>
          </div>
        ))}
        {deltaV !== null && (
          <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border/40 text-[11px]">
            <span className="text-muted-foreground">Overpotential (ΔV):</span>
            <span className="font-semibold text-foreground font-mono">
              {deltaV.toFixed(1)} mV
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function LfpVQChart({ data }: LfpVQChartProps) {
  const [activeCycle, setActiveCycle] = useState<"c12" | "c6">("c12");

  const selectedRate = activeCycle === "c12" ? "C/12" : "C/6";

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const chgPoints = data
      .filter((p) => p.rate_label.includes(selectedRate) && p.step_type === "Charge")
      .sort((a, b) => a.capacity_ah - b.capacity_ah);
    const dchgPoints = data
      .filter((p) => p.rate_label.includes(selectedRate) && p.step_type === "Discharge")
      .sort((a, b) => a.capacity_ah - b.capacity_ah);

    if (chgPoints.length === 0 && dchgPoints.length === 0) return [];

    const interpolate = (pts: LfpVQPoint[], cap: number): number | undefined => {
      if (pts.length === 0) return undefined;
      if (cap <= pts[0].capacity_ah) return pts[0].voltage_v;
      if (cap >= pts[pts.length - 1].capacity_ah) return pts[pts.length - 1].voltage_v;

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

    const maxCap = Math.max(
      chgPoints[chgPoints.length - 1]?.capacity_ah || 50.0,
      dchgPoints[dchgPoints.length - 1]?.capacity_ah || 50.0
    );

    const stepsCount = 100;
    const grid: MergedVQPoint[] = [];
    for (let s = 0; s <= stepsCount; s++) {
      const cap = Number(((s / stepsCount) * maxCap).toFixed(2));
      grid.push({
        capacity_ah: cap,
        v_charge: interpolate(chgPoints, cap),
        v_discharge: interpolate(dchgPoints, cap),
      });
    }
    return grid;
  }, [data, selectedRate]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No V-Q curve data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          Flat Plateau Characteristic of LFP (FePO4 ↔ LiFePO4 Two-Phase Transition)
        </span>

        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveCycle("c12")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeCycle === "c12"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            C/12 Cycle (4.08A)
          </button>
          <button
            type="button"
            onClick={() => setActiveCycle("c6")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeCycle === "c6"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            C/6 Cycle (8.17A)
          </button>
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
              tickFormatter={(v: number) => `${v.toFixed(0)} Ah`}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[2.45, 3.65]}
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
            {/* Shaded LFP flat plateau area */}
            <ReferenceArea
              y1={3.20}
              y2={3.35}
              fill="var(--primary)"
              fillOpacity={0.06}
            />
            <Line
              type="monotone"
              dataKey="v_charge"
              name={`${selectedRate} Charge`}
              stroke="#10b981"
              strokeWidth={2.4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="v_discharge"
              name={`${selectedRate} Discharge`}
              stroke="#06b6d4"
              strokeWidth={2.4}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
