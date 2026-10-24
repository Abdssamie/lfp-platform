"use client";

import { Battery, Gauge, Clock, ShieldCheck } from "lucide-react";
import type { LfpMetadata } from "@/types/api";

interface LfpMetadataBarProps {
  metadata: LfpMetadata | null;
  onOpenOnboarding?: () => void;
}

export function LfpMetadataBar({
  metadata,
}: LfpMetadataBarProps) {
  if (!metadata) return null;

  return (
    <div className="border border-border rounded-lg bg-card p-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-6 w-full">
        {/* 4 Clear Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {/* 1. Usable Capacity */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Battery className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Capacité Mesurée (C/12)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-foreground">
                  {metadata.measured_capacity_ah.toFixed(2)} Ah
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (Nom: {metadata.nominal_capacity_ah.toFixed(1)} Ah)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Flat Redox Plateau Fraction */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Gauge className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Plateau Biphasique LFP
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-foreground">
                  {metadata.plateau_fraction_pct.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (3.20V – 3.35V)
                </span>
              </div>
            </div>
          </div>

          {/* 3. Voltage Range */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Clock className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Fenêtre de Potentiel
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-foreground">
                  {metadata.min_voltage_v.toFixed(2)}V – {metadata.max_voltage_v.toFixed(2)}V
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (Nom: {metadata.nominal_voltage_v.toFixed(1)}V)
                </span>
              </div>
            </div>
          </div>

          {/* 4. Cell Chem Badge */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Chimie &amp; Fabricant
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  LiFePO₄ / Graphite
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  LG Chem 50Ah
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
