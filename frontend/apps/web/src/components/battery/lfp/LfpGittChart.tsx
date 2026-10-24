"use client";

import { useState } from "react";
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
import type { LfpGittPoint, LfpGittCurvePoint } from "@/types/api";

interface LfpGittChartProps {
  pulses: LfpGittPoint[];
  timeline: LfpGittCurvePoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: LfpGittPoint | LfpGittCurvePoint;
  }>;
  label?: number | string;
}

function GittPulseTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) return null;
  const p = payload[0].payload as LfpGittPoint;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">
          GITT Pulse #{p.pulse_index}
        </span>
        <span className="text-muted-foreground">SOC {(p.soc * 100).toFixed(1)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Relaxed OCV:</span>
          <span className="font-bold text-foreground">{p.ocv_relaxed?.toFixed(4)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Pulse End V:</span>
          <span className="font-medium text-muted-foreground">{p.voltage_pulse_end?.toFixed(4)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Internal Resistance:</span>
          <span className="font-semibold text-foreground">{p.r_internal_mohm?.toFixed(2)} mΩ</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">D(Li+):</span>
          <span className="font-semibold text-foreground">{p.d_li_cm2_s?.toExponential(2)} cm²/s</span>
        </div>
      </div>
    </div>
  );
}

function GittTimelineTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) return null;
  const pt = payload[0].payload as LfpGittCurvePoint;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3 font-mono text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 pb-2 mb-2 border-b border-border/60">
        <span className="font-semibold text-foreground">GITT 0.33C Timeline</span>
        <span className="text-muted-foreground">{Number(label).toFixed(2)} hours</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Voltage:</span>
          <span className="font-bold text-foreground">{pt.voltage_v?.toFixed(4)} V</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-semibold text-foreground">{pt.current_a?.toFixed(2)} A</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">SOC:</span>
          <span className="font-medium text-foreground">{((pt.soc || 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function LfpGittChart({ pulses, timeline }: LfpGittChartProps) {
  const [activeTab, setActiveTab] = useState<"kinetics" | "timeline" | "resistance">("kinetics");

  if (!pulses || pulses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-muted-foreground">
        No GITT experimental data available.
      </div>
    );
  }

  // Pre-sort kinetics by SOC
  const sortedPulses = [...pulses].sort((a, b) => a.soc - b.soc);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span className="text-muted-foreground">
          Protocole GITT 0.33C : <strong className="text-foreground font-semibold">118.4 Heures</strong> · 58 Échelons de Titration
        </span>

        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("kinetics")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "kinetics"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Diffusion D_Li⁺ &amp; OCV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resistance")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "resistance"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Résistance DCIR (mΩ)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "timeline"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chronogramme V(t) 118h
          </button>
        </div>
      </div>

      {/* Mode 1: Solid-State Diffusion & Equilibrium OCV vs SOC */}
      {activeTab === "kinetics" && (
        <div className="w-full h-96 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={sortedPulses} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="soc"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="ocv"
                domain={[2.5, 3.65]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(2)}V`}
                orientation="left"
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <YAxis
                yAxisId="dli"
                scale="log"
                domain={[1e-15, 1e-12]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v.toExponential(0)}`}
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<GittPulseTooltip />} />
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
                yAxisId="ocv"
                type="monotone"
                dataKey="ocv_relaxed"
                name="OCV Équilibre (V)"
                stroke="#38bdf8"
                strokeWidth={2.4}
                dot={{ r: 3, fill: "#38bdf8" }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="ocv"
                type="monotone"
                dataKey="voltage_pulse_end"
                name="Tension Fin d'Impulsion (V)"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="dli"
                type="monotone"
                dataKey="d_li_cm2_s"
                name="D_Li⁺ (cm²/s)"
                stroke="#f59e0b"
                strokeWidth={2.0}
                dot={{ r: 2.5, fill: "#f59e0b" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mode 2: DCIR Internal Resistance across SOC */}
      {activeTab === "resistance" && (
        <div className="w-full h-96 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={sortedPulses} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="soc"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 15]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(1)} mΩ`}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<GittPulseTooltip />} />
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
                dataKey="r_internal_mohm"
                name="Résistance Interne d'Impulsion Ri (mΩ)"
                stroke="#10b981"
                strokeWidth={2.2}
                dot={{ r: 3, fill: "#10b981" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mode 3: Continuous 118h GITT Timeline */}
      {activeTab === "timeline" && (
        <div className="w-full h-96 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={timeline} margin={{ top: 16, right: 32, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="runtime_h"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(0)}h`}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={[2.4, 3.7]}
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--foreground)" }}
                tickFormatter={(v: number) => `${v.toFixed(2)}V`}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<GittTimelineTooltip />} />
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
                name="Tension Cellule V(t)"
                stroke="#38bdf8"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
