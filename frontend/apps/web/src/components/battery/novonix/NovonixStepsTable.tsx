"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { NovonixStepSummary } from "@/types/api";

interface NovonixStepsTableProps {
  steps: NovonixStepSummary[];
  selectedStepNumber: number | null;
  onSelectStep?: (stepNumber: number) => void;
}

export function NovonixStepsTable({
  steps,
  selectedStepNumber,
  onSelectStep,
}: NovonixStepsTableProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pulses" | "cc" | "rests">("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Derived filtered steps during render
  const filteredSteps = useMemo(() => {
    return steps.filter((s) => {
      // Type filtering
      if (filterType === "pulses" && !s.step_type.includes("Pulse")) return false;
      if (filterType === "cc" && !s.step_type.includes("0.1C")) return false;
      if (filterType === "rests" && !s.step_type.includes("Rest")) return false;

      // Text search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchNumber = String(s.step_number).includes(query);
        const matchType = s.step_type.toLowerCase().includes(query);
        if (!matchNumber && !matchType) return false;
      }

      return true;
    });
  }, [steps, filterType, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSteps.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageSteps = filteredSteps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDuration = (sec: number) => {
    if (sec >= 3600) {
      return `${(sec / 3600).toFixed(2)} h`;
    }
    if (sec >= 60) {
      return `${(sec / 60).toFixed(1)} m`;
    }
    return `${sec.toFixed(1)} s`;
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs w-full">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFilterType("all");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType("pulses");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterType === "pulses"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            DCIR Pulses (114)
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType("cc");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterType === "cc"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            0.1C Cycles (4)
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType("rests");
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterType === "rests"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Rests (156)
          </button>
        </div>

        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search step #..."
            className="h-7 pl-8 pr-2 text-xs font-mono rounded bg-background/50 border-border/80"
          />
        </div>
      </div>

      {/* Steps Table */}
      <div className="border border-border/80 rounded-md overflow-x-auto bg-card/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] text-muted-foreground uppercase tracking-wider">
              <th className="py-2 px-3 font-medium">Step</th>
              <th className="py-2 px-3 font-medium">Step Profile</th>
              <th className="py-2 px-3 font-medium">Duration</th>
              <th className="py-2 px-3 font-medium text-right">Current</th>
              <th className="py-2 px-3 font-medium text-right">Potential Range</th>
              <th className="py-2 px-3 font-medium text-right">DCIR</th>
              <th className="py-2 px-3 font-medium text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {pageSteps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No steps match the filter criteria.
                </td>
              </tr>
            ) : (
              pageSteps.map((s) => {
                const isSelected = selectedStepNumber === s.step_number;
                const isPulse = s.step_type.includes("Pulse");

                return (
                  <tr
                    key={s.step_number}
                    onClick={() => onSelectStep?.(s.step_number)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/15 font-medium"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-foreground">
                      #{String(s.step_number).padStart(3, "0")}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isPulse
                            ? "bg-primary/20 text-primary font-semibold"
                            : s.step_type.includes("Charge")
                            ? "bg-accent/40 text-accent-foreground"
                            : s.step_type.includes("Discharge")
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.step_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {formatDuration(s.duration_s)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {s.avg_current_a.toFixed(2)} A
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground">
                      {s.min_v.toFixed(3)}V – {s.max_v.toFixed(3)}V
                    </td>
                    <td className="py-2 px-3 text-right">
                      {s.dcir_mohm !== null && s.dcir_mohm !== undefined ? (
                        <span className="font-semibold text-primary">
                          {s.dcir_mohm.toFixed(2)} mΩ
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground">
                      {s.point_count.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <span>
          Showing {(currentPage - 1) * pageSize + 1} –{" "}
          {Math.min(currentPage * pageSize, filteredSteps.length)} of {filteredSteps.length} steps
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-border/80 bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 transition-colors"
          >
            Prev
          </button>
          <span className="px-2 text-foreground font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-border/80 bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
