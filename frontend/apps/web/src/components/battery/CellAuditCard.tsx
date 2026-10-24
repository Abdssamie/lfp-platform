"use client";

import { Badge } from "@/components/ui/badge";
import type { CellEvaluation } from "@/types/api";
import { cn } from "@/lib/utils";

interface CellAuditCardProps {
  evaluation: CellEvaluation | null;
}

export function CellAuditCard({ evaluation }: CellAuditCardProps) {
  if (!evaluation) return null;

  const isGradeA = evaluation.grade === "Grade A";
  const isHazard = evaluation.k_value_mv_day >= 0.5 || evaluation.grade === "Scrap";

  const rows = [
    { label: "Serial ID", val: evaluation.cell_id },
    { label: "Nominal / Actual Capacity", val: `${evaluation.nominal_capacity_ah.toFixed(3)} Ah / ${evaluation.actual_capacity_ah.toFixed(4)} Ah` },
    { label: "Retention Rate", val: `${evaluation.capacity_retention_pct.toFixed(2)}%` },
    { label: "Coulombic Efficiency", val: `${evaluation.coulombic_efficiency_pct.toFixed(2)}%` },
    { label: "DCIR Impedance (≤35 mΩ)", val: `${evaluation.dcir_mohm.toFixed(2)} mΩ`, alert: evaluation.dcir_mohm > 35 },
    { label: "Self-Discharge K (≤0.50 mV/d)", val: `${evaluation.k_value_mv_day.toFixed(4)} mV/day`, alert: evaluation.k_value_mv_day >= 0.5 },
    { label: "Primary Phase Transition Peak", val: `${evaluation.primary_peak_v.toFixed(3)} V (FePO₄ ↔ LiFePO₄)` },
    {
      label: "Diagnostic Verdict",
      badge: (
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[10px] h-4 px-1.5",
            isGradeA
              ? "border-primary/50 text-primary bg-primary/10"
              : isHazard
              ? "border-destructive/50 text-destructive bg-destructive/10"
              : "border-border text-muted-foreground"
          )}
        >
          {evaluation.grade}
        </Badge>
      ),
    },
    {
      label: "Interlock / Failure Flags",
      val: evaluation.failure_reasons.length > 0 ? evaluation.failure_reasons.join(", ") : "None (Passed)",
      alert: evaluation.failure_reasons.length > 0,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm font-mono text-xs">
      <div className="font-semibold text-foreground pb-2 mb-2 border-b border-border/60 uppercase tracking-wider text-[11px]">
        Cell Electrochemical Specification Audit
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 text-[11px]">
            <span className="text-muted-foreground">{r.label}</span>
            {r.badge ? (
              r.badge
            ) : (
              <span className={cn("font-medium", r.alert ? "text-destructive font-semibold" : "text-foreground")}>
                {r.val}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
