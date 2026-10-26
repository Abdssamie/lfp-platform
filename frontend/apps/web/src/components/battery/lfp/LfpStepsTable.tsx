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
} from "lucide-react";
import type { LfpStepSummary } from "@/types/api";
import { cn } from "@/lib/utils";
import { usePlatformTranslation } from "@/lib/translations";

interface LfpStepsTableProps {
  steps: LfpStepSummary[];
  selectedStepIndex: number | null;
  onSelectStep?: (stepIndex: number) => void;
}

export function LfpStepsTable({
  steps,
  selectedStepIndex,
  onSelectStep,
}: LfpStepsTableProps) {
  const { t } = usePlatformTranslation();
  const [filterRegime, setFilterRegime] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const toggleExpand = (stepIndex: number) => {
    setExpandedStepIndex((prev) => (prev === stepIndex ? null : stepIndex));
    onSelectStep?.(stepIndex);
  };

  const formatDuration = (sec: number) => {
    if (sec >= 3600) {
      return `${(sec / 3600).toFixed(1)} ${t.common.hours}`;
    }
    if (sec >= 60) {
      return `${(sec / 60).toFixed(0)} ${t.common.minutes}`;
    }
    return `${sec.toFixed(0)} ${t.common.seconds}`;
  };

  const filteredSteps = steps.filter((s) => {
    const matchesRegime = filterRegime === "all" || s.regime === filterRegime;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      s.step_name.toLowerCase().includes(q) ||
      s.c_rate.toLowerCase().includes(q) ||
      `#${s.step_index}`.includes(q);
    return matchesRegime && matchesSearch;
  });

  const ccCount = steps.filter((s) => s.regime === "Constant Current").length;
  const gittCount = steps.filter((s) => s.regime === "GITT Titration").length;
  const driveCount = steps.filter((s) => s.regime === "Dynamic EV Drive").length;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Sleek, Non-Cluttered Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-1.5 rounded-lg border border-border bg-card">
        {/* Subtle Filter Segment */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "all" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("all")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.common.all} ({steps.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "Constant Current" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("Constant Current")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.cyclers.filterCc} ({ccCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "GITT Titration" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("GITT Titration")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.cyclers.filterGitt} ({gittCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "Dynamic EV Drive" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("Dynamic EV Drive")}
            className="h-7 text-xs px-2 sm:px-2.5 font-mono cursor-pointer"
          >
            {t.cyclers.filterDrive} ({driveCount})
          </Button>
        </div>

        {/* Compact Search Input */}
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.cyclers.filterPlaceholder}
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
              <TableHead className="w-12 font-mono text-xs py-2">{t.cyclers.thStep}</TableHead>
              <TableHead className="font-mono text-xs py-2">{t.cyclers.thRegime}</TableHead>
              <TableHead className="font-mono text-xs py-2 hidden sm:table-cell">{t.cyclers.thType}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">{t.cyclers.thDuration}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right hidden md:table-cell">{t.cyclers.thCurrent}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">{t.cyclers.thCapacity}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right hidden md:table-cell">{t.cyclers.thEnergy}</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right hidden lg:table-cell">{t.cyclers.thVoltageRange}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSteps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-20 text-center font-mono text-xs text-muted-foreground"
                >
                  {t.cyclers.noStepsFound}
                </TableCell>
              </TableRow>
            ) : (
              filteredSteps.map((s) => {
                const isSelected = selectedStepIndex === s.step_index;
                const isExpanded = expandedStepIndex === s.step_index;

                // Specific energy density (Wh/kg) based on 850g cell mass
                const specificEnergyWhKg = (s.energy_wh / 0.85).toFixed(1);

                return (
                  <TableRowGroup key={s.step_index}>
                    {/* Compact Primary Row */}
                    <TableRow
                      onClick={() => toggleExpand(s.step_index)}
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
                        #{s.step_index}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{s.step_name}</span>
                          <span className="text-[10px] text-muted-foreground">{s.c_rate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 font-normal">
                          {s.step_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-right text-muted-foreground">
                        {formatDuration(s.duration_s)}
                      </TableCell>
                      <TableCell className="py-2 text-right font-medium text-foreground hidden md:table-cell">
                        {s.current_a.toFixed(2)} A
                      </TableCell>
                      <TableCell className="py-2 text-right font-bold text-foreground">
                        {s.capacity_ah.toFixed(2)} Ah
                      </TableCell>
                      <TableCell className="py-2 text-right font-semibold text-foreground hidden md:table-cell">
                        {s.energy_wh.toFixed(1)} Wh
                      </TableCell>
                      <TableCell className="py-2 text-right text-muted-foreground text-[11px] hidden lg:table-cell">
                        {s.min_v.toFixed(2)}V – {s.max_v.toFixed(2)}V
                      </TableCell>
                    </TableRow>

                    {/* Spacious, Non-Redundant Detail Drawer */}
                    {isExpanded && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border">
                        <TableCell colSpan={9} className="py-3.5 px-6">
                          <div className="rounded-lg border border-border/50 bg-card/50 p-4 font-mono">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {/* 1. Densité Énergétique */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.cyclers.specificDensity}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {specificEnergyWhKg} Wh/kg
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.cyclers.cellBasis}
                                  </span>
                                </div>
                              </div>

                              {/* 2. Fraction Capacité */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.cyclers.capacityFraction}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {((s.capacity_ah / 50) * 100).toFixed(1)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.cyclers.basis50Ah}
                                  </span>
                                </div>
                              </div>

                              {/* 3. Amplitude Tension */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.cyclers.voltageDelta}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {((s.max_v - s.min_v) * 1000).toFixed(0)} mV
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.cyclers.transientDelta}
                                  </span>
                                </div>
                              </div>

                              {/* 4. Points de Mesure */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  {t.cyclers.samplingPoints}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {s.point_count.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {t.cyclers.samples}
                                  </span>
                                </div>
                              </div>
                            </div>
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
