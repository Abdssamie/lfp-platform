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
  const [filterRegime, setFilterRegime] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const toggleExpand = (stepIndex: number) => {
    setExpandedStepIndex((prev) => (prev === stepIndex ? null : stepIndex));
    onSelectStep?.(stepIndex);
  };

  const formatDuration = (sec: number) => {
    if (sec >= 3600) {
      return `${(sec / 3600).toFixed(1)} h`;
    }
    if (sec >= 60) {
      return `${(sec / 60).toFixed(0)} min`;
    }
    return `${sec.toFixed(0)} s`;
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
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-lg border border-border bg-card">
        {/* Subtle Filter Segment */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "all" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("all")}
            className="h-7 text-xs px-2.5 font-mono cursor-pointer"
          >
            Tous les Essais ({steps.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "Constant Current" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("Constant Current")}
            className="h-7 text-xs px-2.5 font-mono cursor-pointer"
          >
            Courant Constant ({ccCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "GITT Titration" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("GITT Titration")}
            className="h-7 text-xs px-2.5 font-mono cursor-pointer"
          >
            GITT 0.33C ({gittCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterRegime === "Dynamic EV Drive" ? "secondary" : "ghost"}
            onClick={() => setFilterRegime("Dynamic EV Drive")}
            className="h-7 text-xs px-2.5 font-mono cursor-pointer"
          >
            Profil VE ({driveCount})
          </Button>
        </div>

        {/* Compact Search Input */}
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filtrer étape ou régime..."
          className="h-7 w-48 text-xs font-mono px-2"
        />
      </div>

      {/* Clean Table with Inline Expandable Detail */}
      <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="w-8 py-2 px-2 text-center">
                <span className="sr-only">Déplier</span>
              </TableHead>
              <TableHead className="w-12 font-mono text-xs py-2">Étape</TableHead>
              <TableHead className="font-mono text-xs py-2">Régime &amp; Protocole</TableHead>
              <TableHead className="font-mono text-xs py-2">Type</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">Durée</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">Courant</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">Capacité</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">Énergie</TableHead>
              <TableHead className="font-mono text-xs py-2 text-right">Plage V</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSteps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-20 text-center font-mono text-xs text-muted-foreground"
                >
                  Aucune étape ne correspond aux critères.
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
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 font-normal">
                          {s.step_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-right text-muted-foreground">
                        {formatDuration(s.duration_s)}
                      </TableCell>
                      <TableCell className="py-2 text-right font-medium text-foreground">
                        {s.current_a.toFixed(2)} A
                      </TableCell>
                      <TableCell className="py-2 text-right font-bold text-foreground">
                        {s.capacity_ah.toFixed(2)} Ah
                      </TableCell>
                      <TableCell className="py-2 text-right font-semibold text-foreground">
                        {s.energy_wh.toFixed(1)} Wh
                      </TableCell>
                      <TableCell className="py-2 text-right text-muted-foreground text-[11px]">
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
                                  Densité Spécifique
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {specificEnergyWhKg} Wh/kg
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (cellule 850g)
                                  </span>
                                </div>
                              </div>

                              {/* 2. Fraction Capacité */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  Fraction Capacité
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {((s.capacity_ah / 50) * 100).toFixed(1)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (base 50Ah)
                                  </span>
                                </div>
                              </div>

                              {/* 3. Amplitude Tension */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  Amplitude Tension
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {((s.max_v - s.min_v) * 1000).toFixed(0)} mV
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (&Delta;V transitoire)
                                  </span>
                                </div>
                              </div>

                              {/* 4. Points de Mesure */}
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground block">
                                  Points de Mesure
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-foreground font-mono">
                                    {s.point_count.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (échantillons)
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
