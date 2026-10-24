"use client";

import type { TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { activateTourTab } from "./tour-utils";

export function CustomJoyrideTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  isLastStep,
  size,
  tooltipProps,
}: TooltipRenderProps) {
  const isGeneralStep = index === 0;

  const handlePrimaryClick = (e: React.MouseEvent<HTMLElement>) => {
    const targetStr = typeof step.target === "string" ? step.target : "";
    if (targetStr.includes("chart-screening")) {
      void activateTourTab('[data-tour="tab-spc"]');
    }
    primaryProps.onClick?.(e);
  };

  const handleBackClick = (e: React.MouseEvent<HTMLElement>) => {
    const targetStr = typeof step.target === "string" ? step.target : "";
    if (targetStr.includes("chart-spc")) {
      void activateTourTab('[data-tour="tab-screening"]');
    } else if (targetStr.includes("header-datasets")) {
      void activateTourTab('[data-tour="tab-spc"]');
    }
    backProps.onClick?.(e);
  };

  return (
    <div
      {...tooltipProps}
      className="w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-3.5 shadow-2xl text-foreground font-sans z-[10000] relative"
    >
      {/* Header bar: Step badge + Close X */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/60">
        <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5">
          {isGeneralStep ? `Aperçu Plateforme · 1 / ${size}` : `Étape ${index + 1} / ${size}`}
        </Badge>

        <button
          {...closeProps}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer transition-colors"
          title="Fermer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Concise Purpose-Driven Description */}
      <div className="text-xs text-muted-foreground leading-relaxed my-2">
        {step.content}
      </div>

      {/* Footer controls: Previous & Next / Finish (No skip button) */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
        <div>
          {index > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              {...backProps}
              onClick={handleBackClick}
              className="h-7 text-xs font-mono cursor-pointer px-2.5"
            >
              Précédent
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          {...primaryProps}
          onClick={handlePrimaryClick}
          className="h-7 text-xs font-mono cursor-pointer px-3"
        >
          {isLastStep ? "Terminer" : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
