"use client";

import { HelpCircle, Battery, Zap, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewareMetadata } from "@/types/api";

interface NewareMetadataBarProps {
  metadata: NewareMetadata | null;
  onOpenOnboarding: () => void;
}

export function NewareMetadataBar({
  metadata,
  onOpenOnboarding,
}: NewareMetadataBarProps) {
  if (!metadata) return null;

  return (
    <div className="border-b border-border/60 bg-muted/10 px-6 lg:px-8 py-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-6 w-full">
        {/* 3 Clear, Human-Readable Key Metrics + Sanitizer Tag */}
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          {/* 1. Usable Capacity */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Battery className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                0.1C Base Capacity
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-foreground">
                  {metadata.measured_capacity_ah.toFixed(2)} Ah
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (Nom: {metadata.nominal_capacity_ah.toFixed(2)} Ah)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Rate Capability */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Peak Discharge Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold tracking-tight text-primary">
                  9.0C ({metadata.max_discharge_current_a.toFixed(1)} A)
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (98.8% retention)
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
                Protocol Runtime
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

          {/* 4. Time Bug Status Badge */}
          {metadata.time_bug_resolved && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              <div className="flex flex-col">
                <span className="font-semibold leading-tight">Time Bug Resolved</span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {metadata.quarantine_events_count} step-rollover resets stitched monotonically
                </span>
              </div>
            </div>
          )}
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
