"use client";

import type { TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { activateTourTab } from "./tour-utils";
import { usePlatformTranslation } from "@/lib/translations";

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
  const { t, isFr } = usePlatformTranslation();

  const targetStr = typeof step.target === "string" ? step.target : "";
  const isBtmsRunBtnStep = targetStr.includes("btms-run-btn");
  const hasBtmsKpis = typeof document !== "undefined" && Boolean(document.querySelector('[data-tour="btms-kpis"]'));
  const isWaitingForBtmsSimulation = isBtmsRunBtnStep && !hasBtmsKpis;

  const handlePrimaryClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isWaitingForBtmsSimulation) return;
    if (targetStr.includes("chart-screening")) {
      void activateTourTab('[data-tour="tab-spc"]');
    }
    primaryProps.onClick?.(e);
  };

  const handleBackClick = (e: React.MouseEvent<HTMLElement>) => {
    const targetStr = typeof step.target === "string" ? step.target : "";
    if (targetStr.includes("chart-spc")) {
      void activateTourTab('[data-tour="tab-screening"]');
    }
    backProps.onClick?.(e);
  };

  return (
    <div
      {...tooltipProps}
      className="w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-2xl text-foreground font-sans z-[10000] relative"
    >
      {/* Header bar: Step badge + Section title + Close X */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 shrink-0 bg-muted/40">
            {t.common.step} {index + 1} / {size}
          </Badge>
          {step.title && (
            <span className="text-xs font-semibold text-foreground truncate">
              {step.title}
            </span>
          )}
        </div>

        <button
          {...closeProps}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer transition-colors shrink-0 ml-1"
          title={t.common.close}
          aria-label={t.common.close}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Concise Purpose-Driven Description */}
      <div className="text-xs text-muted-foreground leading-relaxed my-2.5">
        {step.content}
      </div>

      {/* Footer controls: Previous & Next / Finish */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
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
              {t.common.previous}
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          {...primaryProps}
          disabled={isWaitingForBtmsSimulation}
          onClick={handlePrimaryClick}
          className="h-7 text-xs font-mono cursor-pointer px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWaitingForBtmsSimulation
            ? (isFr ? "Cliquez sur le bouton..." : "Click button above...")
            : (isLastStep ? t.common.finish : t.common.next)}
        </Button>
      </div>
    </div>
  );
}
