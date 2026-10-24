"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CellEvaluation } from "@/types/api";
import { cn } from "@/lib/utils";

interface ChannelRackProps {
  evaluations: CellEvaluation[];
  selectedCellId: string;
  onSelectCell: (cellId: string) => void;
}

export function ChannelRack({
  evaluations,
  selectedCellId,
  onSelectCell,
}: ChannelRackProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const gradeACount = evaluations.filter((e) => e.grade === "Grade A").length;
  const scrapCount = evaluations.filter((e) => e.grade === "Scrap" || e.k_value_mv_day >= 0.5).length;

  const filtered = evaluations.filter((e) => {
    if (filter === "GRADE_A") return e.grade === "Grade A";
    if (filter === "SCRAP") return e.grade === "Scrap" || e.k_value_mv_day >= 0.5;
    return true;
  });

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 shadow-xs">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-foreground">
            Cycler Channels
          </span>
          <Badge variant="outline" className="font-mono text-[10px] px-1.5 h-4 text-muted-foreground border-border">
            {evaluations.length} total
          </Badge>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Button
            type="button"
            size="sm"
            variant={filter === "ALL" ? "default" : "ghost"}
            onClick={() => setFilter("ALL")}
            className="h-6 px-2.5 text-[11px] rounded-md font-mono"
          >
            All
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "GRADE_A" ? "default" : "ghost"}
            onClick={() => setFilter("GRADE_A")}
            className="h-6 px-2.5 text-[11px] rounded-md font-mono text-primary"
          >
            Grade A ({gradeACount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "SCRAP" ? "destructive" : "ghost"}
            onClick={() => setFilter("SCRAP")}
            className="h-6 px-2.5 text-[11px] rounded-md font-mono text-destructive"
          >
            Hazard ({scrapCount})
          </Button>
        </div>
      </div>

      {/* Grid of channels: Clean, clear, and uncrowded */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {filtered.map((cell) => {
          const isSelected = cell.cell_id === selectedCellId;
          const isHazard = cell.grade === "Scrap" || cell.k_value_mv_day >= 0.5;
          const isGradeA = cell.grade === "Grade A";

          return (
            <button
              key={cell.cell_id}
              type="button"
              onClick={() => onSelectCell(cell.cell_id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border font-mono transition-all cursor-pointer text-center",
                isSelected
                  ? "border-primary bg-primary/15 text-primary ring-1 ring-primary font-bold shadow-xs"
                  : isHazard
                  ? "border-destructive/30 bg-destructive/5 hover:border-destructive/60 text-foreground"
                  : "border-border/60 bg-background/50 hover:border-primary/40 text-foreground"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold">
                  CH{cell.channel_id.toString().padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    isHazard
                      ? "bg-destructive animate-pulse"
                      : isGradeA
                      ? "bg-primary"
                      : "bg-muted-foreground/60"
                  )}
                />
              </div>

              <span className="text-[10px] text-muted-foreground mt-0.5">
                {cell.actual_capacity_ah.toFixed(2)} Ah
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
