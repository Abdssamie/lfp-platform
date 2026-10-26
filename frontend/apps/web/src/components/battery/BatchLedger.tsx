"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { CellEvaluation } from "@/types/api";
import { cn } from "@/lib/utils";
import { usePlatformTranslation, localizeFailureReason, localizeGrade } from "@/lib/translations";

interface BatchLedgerProps {
  evaluations: CellEvaluation[];
  selectedCellId: string;
  onSelectCell: (cellId: string) => void;
}

export function BatchLedger({
  evaluations,
  selectedCellId,
  onSelectCell,
}: BatchLedgerProps) {
  const { isFr, t } = usePlatformTranslation();
  const [filterGrade, setFilterGrade] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCellId, setExpandedCellId] = useState<string | null>(null);

  const toggleExpand = (cellId: string) => {
    setExpandedCellId((prev) => (prev === cellId ? null : cellId));
    onSelectCell(cellId);
  };

  const filteredCells = evaluations.filter((cell) => {
    const matchesGrade = filterGrade === "ALL" || cell.grade === filterGrade;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      cell.cell_id.toLowerCase().includes(q) ||
      `ch ${cell.channel_id}`.includes(q) ||
      `canal ${cell.channel_id}`.includes(q);
    return matchesGrade && matchesSearch;
  });

  const gradeACount = evaluations.filter((c) => c.grade === "Grade A").length;
  const gradeBCount = evaluations.filter((c) => c.grade === "Grade B").length;
  const scrapCount = evaluations.filter((c) => c.grade === "Scrap").length;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Sleek, Non-Cluttered Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-1.5 rounded-lg border border-border bg-card">
        {/* Subtle Filter Segment */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          <Button
            type="button"
            size="sm"
            variant={filterGrade === "ALL" ? "secondary" : "ghost"}
            onClick={() => setFilterGrade("ALL")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.common.all} ({evaluations.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterGrade === "Grade A" ? "secondary" : "ghost"}
            onClick={() => setFilterGrade("Grade A")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.common.gradeA} ({gradeACount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterGrade === "Grade B" ? "secondary" : "ghost"}
            onClick={() => setFilterGrade("Grade B")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.common.gradeB} ({gradeBCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterGrade === "Scrap" ? "secondary" : "ghost"}
            onClick={() => setFilterGrade("Scrap")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer text-destructive"
          >
            {t.common.scrap} ({scrapCount})
          </Button>
        </div>

        {/* Compact Search Input */}
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.formation.filterPlaceholder}
          className="h-7 w-full sm:w-44 text-xs font-mono px-2 sm:ml-auto"
        />
      </div>

      {/* Clean Table with Inline Expandable Detail */}
      <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="w-8 py-2 px-2 text-center">
                <span className="sr-only">Toggle</span>
              </TableHead>
              <TableHead className="w-14 font-mono text-xs py-2">{t.formation.channel}</TableHead>
              <TableHead className="font-mono text-xs py-2 hidden md:table-cell">{t.formation.serialId}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">{t.formation.capacity}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right hidden sm:table-cell">{t.formation.dcir}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right hidden sm:table-cell">{t.formation.kValue}</TableHead>
              <TableHead className="font-mono text-xs py-2">{t.formation.iatfSorting}</TableHead>
              <TableHead className="font-mono text-xs py-2">{t.formation.compliance}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCells.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-20 text-center font-mono text-xs text-muted-foreground"
                >
                  {t.formation.noCellsFound}
                </TableCell>
              </TableRow>
            ) : (
              filteredCells.map((cell) => {
                const isSelected = cell.cell_id === selectedCellId;
                const isExpanded = expandedCellId === cell.cell_id;
                const isGradeA = cell.grade === "Grade A";
                const isHazard = cell.k_value_mv_day >= 0.5 || cell.grade === "Scrap";
                const hasDcirAlert = cell.dcir_mohm > 35.0;

                return (
                  <TableRowGroup key={cell.cell_id}>
                    {/* Compact Primary Row */}
                    <TableRow
                      onClick={() => toggleExpand(cell.cell_id)}
                      className={cn(
                        "cursor-pointer font-mono text-xs transition-colors border-b border-border/40",
                        isExpanded
                          ? "bg-muted/40 font-medium"
                          : isSelected
                          ? "bg-muted/20"
                          : "hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="py-2 px-2 text-center text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 inline-block text-foreground" />
                        ) : (
                          <ChevronRight className="size-3.5 inline-block" />
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-2">
                        CH{cell.channel_id.toString().padStart(2, "0")}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 font-mono hidden md:table-cell">
                        {cell.cell_id}
                      </TableCell>
                      <TableCell className="py-2 text-right font-bold text-foreground">
                        {cell.actual_capacity_ah.toFixed(3)} Ah
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2 text-right font-mono hidden sm:table-cell",
                          hasDcirAlert ? "text-destructive font-bold" : "text-foreground"
                        )}
                      >
                        {cell.dcir_mohm.toFixed(1)} mΩ
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2 text-right font-mono hidden sm:table-cell",
                          isHazard ? "text-destructive font-bold" : "text-foreground"
                        )}
                      >
                        {cell.k_value_mv_day.toFixed(3)} mV/j
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px] h-4 px-1.5",
                            isGradeA
                              ? "border-border text-foreground bg-muted/50"
                              : isHazard
                              ? "border-destructive text-destructive bg-destructive/10"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          {localizeGrade(cell.grade, isFr)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground text-[11px]">
                        {cell.failure_reasons.length > 0 ? (
                          <span className="text-destructive font-medium flex items-center gap-1">
                            <AlertTriangle className="size-3 shrink-0" />
                            {cell.failure_reasons.map((r) => localizeFailureReason(r, isFr)).join(", ")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="size-3 shrink-0 text-foreground" />
                            {t.common.compliant}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Spacious, Non-Redundant Detail Drawer */}
                    {isExpanded && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border">
                        <TableCell colSpan={8} className="py-3.5 px-6">
                          <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3 font-mono">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {/* 1. Rétention Lot */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.formation.batchRetention}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {cell.capacity_retention_pct.toFixed(2)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.formation.specTarget}
                                  </span>
                                </div>
                              </div>

                              {/* 2. Rendement Coulombien */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.formation.coulombicEfficiency}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {cell.coulombic_efficiency_pct.toFixed(2)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.formation.formationCycle}
                                  </span>
                                </div>
                              </div>

                              {/* 3. Pic Redox dQ/dV */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.formation.redoxPeak}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {cell.primary_peak_v.toFixed(3)} V
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (LiFePO₄)
                                  </span>
                                </div>
                              </div>

                              {/* 4. Affectation Ligne */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.formation.lineAssignment}
                                </span>
                                <div className="pt-0.5">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs h-6 px-2.5 font-mono font-medium",
                                      isGradeA
                                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                        : isHazard
                                        ? "border-destructive/40 text-destructive bg-destructive/10"
                                        : "border-border text-foreground bg-muted/40"
                                    )}
                                  >
                                    {cell.grade === "Grade A"
                                      ? t.formation.evPack
                                      : cell.grade === "Grade B"
                                      ? t.formation.bessGrid
                                      : t.formation.scrapQuarantine}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Failure reason if rejected */}
                            {cell.failure_reasons.length > 0 && (
                              <div className="pt-2.5 border-t border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span className="font-semibold">{t.formation.rejectionReason}</span>
                                <span>{cell.failure_reasons.map((r) => localizeFailureReason(r, isFr)).join(" · ")}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableRowGroup>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TableRowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
