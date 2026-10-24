"use client";

import * as React from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { SectionCards } from "./components/section-cards";
import { useWorkstation } from "@/contexts/workstation-context";
import { ChannelRack } from "@/components/battery/ChannelRack";
import { CellSummaryStrip } from "@/components/battery/CellSummaryStrip";
import { CellAuditCard } from "@/components/battery/CellAuditCard";
import { BatchLedger } from "@/components/battery/BatchLedger";
import { ScreeningChart } from "@/components/battery/charts/ScreeningChart";
import { SPCChart } from "@/components/battery/charts/SPCChart";
import { BTMSPanel } from "@/components/battery/BTMSPanel";
import { useIntlayer } from "react-intlayer";

// Novonix components
import { NovonixMetadataBar } from "@/components/battery/novonix/NovonixMetadataBar";
import { NovonixTelemetryChart } from "@/components/battery/novonix/NovonixTelemetryChart";
import { NovonixVQChart } from "@/components/battery/novonix/NovonixVQChart";
import { NovonixDQDVChart } from "@/components/battery/novonix/NovonixDQDVChart";
import { NovonixDCIRChart } from "@/components/battery/novonix/NovonixDCIRChart";
import { NovonixStepsTable } from "@/components/battery/novonix/NovonixStepsTable";

// Neware components
import { NewareMetadataBar } from "@/components/battery/neware/NewareMetadataBar";
import { NewareTelemetryChart } from "@/components/battery/neware/NewareTelemetryChart";
import { NewareRateCurvesChart } from "@/components/battery/neware/NewareRateCurvesChart";
import { NewareDQDVChart } from "@/components/battery/neware/NewareDQDVChart";
import { NewareRateRetentionChart } from "@/components/battery/neware/NewareRateRetentionChart";
import { NewareStepsTable } from "@/components/battery/neware/NewareStepsTable";

// LFP components
import { LfpMetadataBar } from "@/components/battery/lfp/LfpMetadataBar";
import { LfpTelemetryChart } from "@/components/battery/lfp/LfpTelemetryChart";
import { LfpVQChart } from "@/components/battery/lfp/LfpVQChart";
import { LfpDQDVChart } from "@/components/battery/lfp/LfpDQDVChart";
import { LfpStepsTable } from "@/components/battery/lfp/LfpStepsTable";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  MOCK_BATCH,
  MOCK_SCREENING,
  MOCK_SPC,
  MOCK_NOVONIX,
  MOCK_NEWARE,
  MOCK_LFP,
} from "@/lib/mock-data";
import {
  fetchBatchCurrent,
  fetchScreeningScatter,
  fetchSPCSummary,
  fetchNovonixDataset,
  fetchNewareDataset,
  fetchLfpDataset,
} from "@/lib/api";
import type {
  BatchSummaryResponse,
  ScreeningScatterResponse,
  SPCSummaryResponse,
  NovonixDatasetResponse,
  NewareDatasetResponse,
  LfpDatasetResponse,
} from "@/types/api";

export default function DashboardPage() {
  const content = useIntlayer("dashboard");
  const { workspace, dataset, setDataset, selectedChannel, setSelectedChannel, refreshTrigger } =
    useWorkstation();

  // Primary dataset states initialized directly from validated mocks
  const [batchData, setBatchData] = React.useState<BatchSummaryResponse>(MOCK_BATCH);
  const [screeningData, setScreeningData] = React.useState<ScreeningScatterResponse>(MOCK_SCREENING);
  const [spcData, setSpcData] = React.useState<SPCSummaryResponse>(MOCK_SPC);
  const [novonixData, setNovonixData] = React.useState<NovonixDatasetResponse>(MOCK_NOVONIX);
  const [newareData, setNewareData] = React.useState<NewareDatasetResponse>(MOCK_NEWARE);
  const [lfpData, setLfpData] = React.useState<LfpDatasetResponse>(MOCK_LFP);

  // Derived selected cell calculated during render
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

  // React to explicit user sync action (refreshTrigger increments on button click)
  const prevTriggerRef = React.useRef(refreshTrigger);
  React.useEffect(() => {
    if (prevTriggerRef.current !== refreshTrigger) {
      prevTriggerRef.current = refreshTrigger;
      void Promise.allSettled([
        fetchBatchCurrent(),
        fetchScreeningScatter(),
        fetchSPCSummary(),
        fetchNovonixDataset(),
        fetchNewareDataset(),
        fetchLfpDataset(),
      ]).then(([b, s, spc, nov, newr, lfp]) => {
        if (b.status === "fulfilled") setBatchData(b.value);
        if (s.status === "fulfilled") setScreeningData(s.value);
        if (spc.status === "fulfilled") setSpcData(spc.value);
        if (nov.status === "fulfilled") setNovonixData(nov.value);
        if (newr.status === "fulfilled") setNewareData(newr.value);
        if (lfp.status === "fulfilled") setLfpData(lfp.value);
      });
    }
  }, [refreshTrigger]);

  const pageTitle = String(
    content?.pageTitle?.value ??
    content?.pageTitle ??
    content?.page?.title?.value ??
    content?.page?.title ??
    "Plateforme Analytique & Ligne de Formation LFP"
  );

  const pageDesc = String(
    content?.pageDesc?.value ??
    content?.pageDesc ??
    content?.page?.description?.value ??
    content?.page?.description ??
    "Contrôle Qualité SPC Formation · Courbes Cyclage Labo · Simulation Thermique BTMS"
  );

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-4">
        {/* KPI Strip */}
        <SectionCards batch={batchData} spc={spcData} />

        {/* WORKSPACE 1: FORMATION LINE SPC */}
        {workspace === "formation" && (
          <div className="space-y-4">
            {/* Top 2-Column Industrial Formation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: 24-Channel Cabinet Rack & Cell Inspection */}
              <div className="lg:col-span-5 space-y-4">
                <ChannelRack
                  evaluations={batchData.evaluations}
                  selectedCellId={selectedCell?.cell_id || ""}
                  onSelectCell={handleSelectCell}
                />
                <CellSummaryStrip evaluation={selectedCell} />
                <CellAuditCard evaluation={selectedCell} />
              </div>

              {/* Right Column: Interactive IATF 16949 Screening & SPC Shewhart Run Charts */}
              <div className="lg:col-span-7">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Process Qualification & Quality Boundaries
                    </CardTitle>
                    <CardDescription className="text-xs">
                      IATF 16949 K-value vs DCIR quadrant screening and Shewhart statistical process control.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Tabs defaultValue="screening" className="w-full">
                      <TabsList className="mb-3">
                        <TabsTrigger value="screening" className="text-xs">
                          Screening Quadrants
                        </TabsTrigger>
                        <TabsTrigger value="spc" className="text-xs">
                          Shewhart SPC Run Chart
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="screening" className="mt-0">
                        <ScreeningChart
                          cells={screeningData.cells}
                          kThreshold={screeningData.k_threshold_mv_day}
                          dcirThreshold={screeningData.dcir_threshold_mohm}
                          selectedCellId={selectedCell?.cell_id}
                          onSelectCell={handleSelectCell}
                        />
                      </TabsContent>
                      <TabsContent value="spc" className="mt-0">
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

            {/* Bottom: Batch Ledger Data Table */}
            <div className="pt-1">
              <BatchLedger
                evaluations={batchData.evaluations}
                selectedCellId={selectedCell?.cell_id || ""}
                onSelectCell={handleSelectCell}
              />
            </div>
          </div>
        )}

        {/* WORKSPACE 2: CYCLER LAB CURVES */}
        {workspace === "cyclers" && (
          <div className="space-y-4">
            <Card className="p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Cycler Telemetry & Degradation Lab
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Switch between laboratory dataset channels to inspect voltage, dQ/dV, and DCIR evolution.
                  </p>
                </div>
                <Tabs value={dataset} onValueChange={(val) => setDataset(val as typeof dataset)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="novonix" className="text-xs px-2.5">
                      Novonix HPPC (#8001)
                    </TabsTrigger>
                    <TabsTrigger value="neware" className="text-xs px-2.5">
                      Neware Fast-Rate (0.5C - 3C)
                    </TabsTrigger>
                    <TabsTrigger value="lfp" className="text-xs px-2.5">
                      Commercial LFP 50Ah
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            {/* Novonix View */}
            {dataset === "novonix" && (
              <div className="space-y-4">
                <NovonixMetadataBar metadata={novonixData.metadata} onOpenOnboarding={() => {}} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NovonixTelemetryChart data={novonixData.telemetry} />
                  <NovonixVQChart data={novonixData.vq_curve} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NovonixDQDVChart data={novonixData.dqdv_curve} />
                  <NovonixDCIRChart
                    pulses={novonixData.dcir_pulses}
                    meanDcir={novonixData.metadata.mean_dcir_mohm}
                  />
                </div>
                <NovonixStepsTable steps={novonixData.steps} selectedStepNumber={null} />
              </div>
            )}

            {/* Neware View */}
            {dataset === "neware" && (
              <div className="space-y-4">
                <NewareMetadataBar metadata={newareData.metadata} onOpenOnboarding={() => {}} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NewareTelemetryChart data={newareData.telemetry} />
                  <NewareRateCurvesChart data={newareData.rate_curves} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <NewareDQDVChart data={newareData.dqdv_curve} />
                  <NewareRateRetentionChart data={newareData.rate_retention} />
                </div>
                <NewareStepsTable steps={newareData.steps} selectedStepIndex={null} />
              </div>
            )}

            {/* LFP View */}
            {dataset === "lfp" && (
              <div className="space-y-4">
                <LfpMetadataBar metadata={lfpData.metadata} onOpenOnboarding={() => {}} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <LfpTelemetryChart data={lfpData.telemetry} />
                  <LfpVQChart data={lfpData.vq_curves} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <LfpDQDVChart data={lfpData.dqdv_curve} />
                </div>
                <LfpStepsTable steps={lfpData.steps} selectedStepIndex={null} />
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE 3: BTMS THERMAL SIMULATOR */}
        {workspace === "btms" && (
          <div className="space-y-4">
            <BTMSPanel />
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
