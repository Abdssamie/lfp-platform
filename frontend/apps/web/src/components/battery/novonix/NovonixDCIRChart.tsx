"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { NovonixDCIRPulse } from "@/types/api";

interface NovonixDCIRChartProps {
  pulses: NovonixDCIRPulse[];
  meanDcir: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: NovonixDCIRPulse;
  }>;
}

function DCIRTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">Step #{p.step}</span>
        <span className="text-primary font-medium">{p.type}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">DCIR:</span>
          <span className="font-bold text-primary">{p.dcir_mohm.toFixed(2)} mΩ</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Pulse Current:</span>
          <span className="font-semibold text-foreground">{p.current_a.toFixed(1)} A</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Potential:</span>
          <span className="font-medium text-foreground">{p.v_mean.toFixed(3)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Drop (ΔV):</span>
          <span className="font-medium text-foreground">{(p.delta_v * 1000).toFixed(1)} mV</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Duration:</span>
          <span className="font-medium text-muted-foreground">{p.duration_s.toFixed(1)}s</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Temp:</span>
          <span className="font-medium text-muted-foreground">{p.temp_c.toFixed(1)} °C</span>
        </div>
      </div>
    </div>
  );
}

export function NovonixDCIRChart({ pulses, meanDcir }: NovonixDCIRChartProps) {
  const [xAxisMode, setXAxisMode] = useState<"voltage" | "step">("voltage");

  if (pulses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No DCIR pulse data available.
      </div>
    );
  }

  const dischargePulses = pulses
    .filter((p) => p.type.includes("Discharge"))
    .map((p) => ({
      ...p,
      xVal: xAxisMode === "voltage" ? p.v_mean : p.step,
    }));

  const chargePulses = pulses
    .filter((p) => p.type.includes("Charge"))
    .map((p) => ({
      ...p,
      xVal: xAxisMode === "voltage" ? p.v_mean : p.step,
    }));

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Spacious Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          Average Internal Resistance:{" "}
          <strong className="text-foreground font-semibold text-sm">
            {meanDcir.toFixed(2)} mΩ
          </strong>
        </span>

        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setXAxisMode("voltage")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              xAxisMode === "voltage"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            vs. Voltage (SOC)
          </button>
          <button
            type="button"
            onClick={() => setXAxisMode("step")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              xAxisMode === "step"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            vs. Step Number
          </button>
        </div>
      </div>

      {/* Spacious Chart Area */}
      <div className="w-full h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ScatterChart margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              type="number"
              dataKey="xVal"
              name={xAxisMode === "voltage" ? "Voltage" : "Step"}
              domain={xAxisMode === "voltage" ? [3.0, 4.38] : ["auto", "auto"]}
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) =>
                xAxisMode === "voltage" ? `${v.toFixed(2)}V` : `#${v}`
              }
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="dcir_mohm"
              name="DCIR"
              domain={[4.0, 14.0]}
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v.toFixed(0)} mΩ`}
              orientation="left"
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<DCIRTooltip />} />
            <ReferenceLine
              y={meanDcir}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Mean: ${meanDcir.toFixed(2)} mΩ`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                paddingBottom: 8,
              }}
            />
            <Scatter
              name="Discharge Pulse (-20A)"
              data={dischargePulses}
              fill="var(--primary)"
              line={false}
              shape="circle"
              isAnimationActive={false}
            />
            <Scatter
              name="Charge Pulse (+20A)"
              data={chargePulses}
              fill="var(--foreground)"
              line={false}
              shape="circle"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
