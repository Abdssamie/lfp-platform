"use client";

import * as React from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { useWorkstation } from "@/contexts/workstation-context";
import { BatchLedger } from "@/components/battery/BatchLedger";
import { ScreeningChart } from "@/components/battery/charts/ScreeningChart";
import { SPCChart } from "@/components/battery/charts/SPCChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react";
import { MOCK_BATCH, MOCK_SCREENING, MOCK_SPC } from "@/lib/mock-data";
import { fetchBatchCurrent, fetchScreeningScatter, fetchSPCSummary } from "@/lib/api";
import type { BatchSummaryResponse, ScreeningScatterResponse, SPCSummaryResponse } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";

export default function FormationPage() {
  const { t } = usePlatformTranslation();
  const { selectedChannel, setSelectedChannel, refreshTrigger } = useWorkstation();

  const [batchData, setBatchData] = React.useState<BatchSummaryResponse>(MOCK_BATCH);
  const [screeningData, setScreeningData] = React.useState<ScreeningScatterResponse>(MOCK_SCREENING);
  const [spcData, setSpcData] = React.useState<SPCSummaryResponse>(MOCK_SPC);

  const selectedCell = React.useMemo(() => {
    const found = batchData.evaluations.find((c) => c.channel_id === selectedChannel);
    return found || batchData.evaluations[0] || null;
  }, [batchData.evaluations, selectedChannel]);

  const handleSelectCell = React.useCallback(
    (cellId: string) => {
      const found = batchData.evaluations.find((c) => c.cell_id === cellId);
      if (found) {
        setSelectedChannel(found.channel_id);
      }
    },
    [batchData.evaluations, setSelectedChannel],
  );

  const prevTriggerRef = React.useRef(refreshTrigger);
  React.useEffect(() => {
    if (prevTriggerRef.current !== refreshTrigger) {
      prevTriggerRef.current = refreshTrigger;
      void Promise.allSettled([
        fetchBatchCurrent(),
        fetchScreeningScatter(),
        fetchSPCSummary(),
      ]).then(([b, s, spc]) => {
        if (b.status === "fulfilled") setBatchData(b.value);
        if (s.status === "fulfilled") setScreeningData(s.value);
        if (spc.status === "fulfilled") setSpcData(spc.value);
      });
    }
  }, [refreshTrigger]);

  const pageTitle = t.formation.pageTitle;
  const pageDesc = t.formation.pageDesc;

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-5">
        {/* Sleek Context & KPI Strip */}
        <div
          data-tour="formation-kpis"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-mono text-muted-foreground">{t.formation.pilotBatch}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {t.formation.pilotBatchValue}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {t.formation.restCondition}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs gap-1">
              <CheckCircle2 className="size-3" />
              {t.formation.yield} {batchData.yield_pct.toFixed(1)}% ({batchData.grade_a_count}/24 {t.common.gradeA})
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Cpk: {spcData.cpk.toFixed(2)} (6σ)
            </Badge>
          </div>
        </div>

        {/* =========================================================================
            1. DATA TABLE FIRST THING SHOWN (Clean, High-Density, Expandable Rows)
           ========================================================================= */}
        <div data-tour="batch-ledger" className="space-y-2">
          <BatchLedger
            evaluations={batchData.evaluations}
            selectedCellId={selectedCell?.cell_id || ""}
            onSelectCell={handleSelectCell}
          />
        </div>

        {/* =========================================================================
            2. STATISTICAL PROCESS CHARTS (Screening Matrix & Shewhart SPC)
           ========================================================================= */}
        <div data-tour="spc-qualification" className="space-y-3 pt-2">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {t.formation.processQualificationTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.formation.processQualificationDesc}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="screening" className="w-full">
                <TabsList className="mb-3 h-auto flex-wrap">
                  <TabsTrigger
                    value="screening"
                    data-tour="tab-screening"
                    className="text-xs cursor-pointer gap-1.5"
                  >
                    <SlidersHorizontal className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t.formation.tabScreening}</span>
                    <span className="sm:hidden">{t.formation.tabScreeningShort}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="spc"
                    data-tour="tab-spc"
                    className="text-xs cursor-pointer gap-1.5"
                  >
                    <BarChart3 className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">{t.formation.tabSpc}</span>
                    <span className="sm:hidden">{t.formation.tabSpcShort}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="screening" className="mt-0" data-tour="chart-screening">
                  <ScreeningChart
                    cells={screeningData.cells}
                    kThreshold={screeningData.k_threshold_mv_day}
                    dcirThreshold={screeningData.dcir_threshold_mohm}
                    selectedCellId={selectedCell?.cell_id}
                    onSelectCell={handleSelectCell}
                  />
                </TabsContent>

                <TabsContent value="spc" className="mt-0" data-tour="chart-spc">
                  <SPCChart
                    summary={spcData}
                    onSelectCell={handleSelectCell}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
