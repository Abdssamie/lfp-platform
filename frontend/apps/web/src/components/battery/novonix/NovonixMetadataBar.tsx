"use client";

import { HelpCircle, Battery, Gauge, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NovonixMetadata } from "@/types/api";

interface NovonixMetadataBarProps {
  metadata: NovonixMetadata | null;
  onOpenOnboarding: () => void;
}

export function NovonixMetadataBar({
  metadata,
  onOpenOnboarding,
}: NovonixMetadataBarProps) {
  if (!metadata) return null;

  return (
    <div className="border-b border-border/60 bg-muted/10 px-6 lg:px-8 py-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-6 w-full">
        {/* 3 Clear, Human-Readable Key Metrics */}
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          {/* 1. Usable Capacity */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Battery className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Usable Capacity
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

          {/* 2. Internal Resistance */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gauge className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Internal Resistance (DCIR)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-primary">
                  {metadata.mean_dcir_mohm.toFixed(2)} mΩ
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (114 pulses)
                </span>
              </div>
            </div>
          </div>

          {/* 3. Test Runtime */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Lab Test Duration
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-foreground">
                  {metadata.total_runtime_h.toFixed(1)} Hours
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({metadata.total_steps} steps)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Onboarding Guide Trigger */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onOpenOnboarding}
            variant="default"
            size="sm"
            className="h-9 px-4 text-xs font-mono font-semibold gap-2 shadow-xs cursor-pointer"
          >
            <HelpCircle className="size-4" />
            <span>Guide: How to Read This Lab</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
