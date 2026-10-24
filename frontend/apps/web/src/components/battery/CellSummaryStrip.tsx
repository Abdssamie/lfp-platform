"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CellEvaluation } from "@/types/api";
import { cn } from "@/lib/utils";

interface CellSummaryStripProps {
  evaluation: CellEvaluation | null;
}

export function CellSummaryStrip({ evaluation }: CellSummaryStripProps) {
  if (!evaluation) {
    return <Skeleton className="h-16 w-full rounded-xl" />;
  }

  const isGradeA = evaluation.grade === "Grade A";
  const isHazard = evaluation.k_value_mv_day >= 0.5 || evaluation.grade === "Scrap";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
      {/* Channel & Serial ID */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-bold text-foreground">
            Channel {evaluation.channel_id.toString().padStart(2, "0")}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs px-2 py-0.5",
              isGradeA
                ? "border-primary/50 text-primary bg-primary/10"
                : isHazard
                ? "border-destructive/50 text-destructive bg-destructive/10"
                : "border-border text-muted-foreground"
            )}
          >
            {evaluation.grade}
          </Badge>
        </div>
        <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
          {evaluation.cell_id}
        </span>
      </div>

      {/* Primary Electrochemical Readouts */}
      <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Discharge Q</div>
          <div className="text-sm font-bold text-primary">{evaluation.actual_capacity_ah.toFixed(3)} Ah</div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">DCIR</div>
          <div className={cn("text-sm font-bold", evaluation.dcir_mohm > 35 ? "text-destructive" : "text-foreground")}>
            {evaluation.dcir_mohm.toFixed(1)} mΩ
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">K-Value</div>
          <div className={cn("text-sm font-bold", isHazard ? "text-destructive" : "text-foreground")}>
            {evaluation.k_value_mv_day.toFixed(3)} mV/d
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Phase Peak</div>
          <div className="text-sm font-semibold text-foreground">{evaluation.primary_peak_v.toFixed(3)} V</div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Coulombic Eff</div>
          <div className="text-sm font-semibold text-foreground">{evaluation.coulombic_efficiency_pct.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
