"use client";

import * as React from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Layers,
  Zap,
  Activity,
  BarChart3,
} from "lucide-react";

import { LfpStepsTable } from "@/components/battery/lfp/LfpStepsTable";
import { LfpTelemetryChart } from "@/components/battery/lfp/LfpTelemetryChart";
import { LfpVQChart } from "@/components/battery/lfp/LfpVQChart";
import { LfpDQDVChart } from "@/components/battery/lfp/LfpDQDVChart";
import { LfpGittChart } from "@/components/battery/lfp/LfpGittChart";
import { LfpDriveProfileChart } from "@/components/battery/lfp/LfpDriveProfileChart";

import { MOCK_LFP } from "@/lib/mock-data";
import { fetchLfpDataset } from "@/lib/api";
import type { LfpDatasetResponse } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";

export default function CyclersPage() {
  const { t } = usePlatformTranslation();
  const [lfpData, setLfpData] = React.useState<LfpDatasetResponse>(MOCK_LFP);
  const [selectedRegime, setSelectedRegime] = React.useState<"cc" | "gitt" | "drive">("cc");
  const [selectedStepIndex, setSelectedStepIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    void fetchLfpDataset()
      .then((res) => {
        if (res) setLfpData(res);
      })
      .catch((err) => {
        console.warn("fetchLfpDataset fallback to simulated dataset:", err);
      });
  }, []);

  const pageTitle = t.cyclers.pageTitle;
  const pageDesc = t.cyclers.pageDesc;

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-5">
        {/* Sleek Context & KPI Strip */}
        <div
          data-tour="cyclers-kpis"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-mono text-muted-foreground">{t.cyclers.specimenLabel}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {t.cyclers.specimenValue}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {t.cyclers.chemistry}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {t.cyclers.biphasicPlateau} {lfpData.metadata.plateau_fraction_pct.toFixed(1)}% (3.20V–3.35V)
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {lfpData.metadata.min_voltage_v.toFixed(2)}V – {lfpData.metadata.max_voltage_v.toFixed(2)}V
            </Badge>
            <Badge variant="outline" className="font-mono text-xs gap-1">
              <CheckCircle2 className="size-3" />
              {t.cyclers.validatedSteps}
            </Badge>
          </div>
        </div>

        {/* =========================================================================
            1. DATA TABLE FIRST THING SHOWN (Clean, High-Density, Expandable Rows)
           ========================================================================= */}
        <div data-tour="lfp-steps-table" className="space-y-2">
          <LfpStepsTable
            steps={lfpData.steps}
            selectedStepIndex={selectedStepIndex}
            onSelectStep={(idx) => setSelectedStepIndex(idx)}
          />
        </div>

        {/* =========================================================================
            2. GRAPHICAL CHARACTERIZATION & PHYSICAL KINETICS
           ========================================================================= */}
        <div data-tour="cyclers-charts" className="space-y-3 pt-2">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="size-4" />
                    {t.cyclers.chartsCardTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.cyclers.chartsCardDesc}
                  </CardDescription>
                </div>

                <div data-tour="cyclers-tabs">
                  <Tabs
                    value={selectedRegime}
                    onValueChange={(val) => setSelectedRegime(val as typeof selectedRegime)}
                  >
                    <TabsList className="h-8 w-full sm:w-auto">
                      <TabsTrigger value="cc" className="text-xs px-2 sm:px-2.5 cursor-pointer gap-1 sm:gap-1.5 font-mono flex-1 sm:flex-none">
                        <Layers className="size-3.5 shrink-0" />
                        <span className="hidden xs:inline">Pseudo-OCV</span>
                        <span className="xs:hidden">OCV</span>
                        <span className="hidden sm:inline"> &amp; dQ/dV</span>
                      </TabsTrigger>
                      <TabsTrigger value="gitt" className="text-xs px-2 sm:px-2.5 cursor-pointer gap-1 sm:gap-1.5 font-mono flex-1 sm:flex-none">
                        <Zap className="size-3.5 shrink-0" />
                        <span className="hidden sm:inline">Titration </span>GITT
                      </TabsTrigger>
                      <TabsTrigger value="drive" className="text-xs px-2 sm:px-2.5 cursor-pointer gap-1 sm:gap-1.5 font-mono flex-1 sm:flex-none">
                        <Activity className="size-3.5 shrink-0" />
                        <span className="hidden sm:inline">Profil </span>VE
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* REGIME 1: CONSTANT CURRENT (Pseudo-OCV & dQ/dV Phase Transitions) */}
              {selectedRegime === "cc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-3 border border-border rounded-lg bg-card">
                      <div className="mb-2 text-xs font-mono font-medium text-foreground">
                        {t.cyclers.telemetryTitle}
                      </div>
                      <LfpTelemetryChart data={lfpData.telemetry} />
                    </div>

                    <div className="p-3 border border-border rounded-lg bg-card">
                      <div className="mb-2 text-xs font-mono font-medium text-foreground">
                        {t.cyclers.vqPlateauTitle}
                      </div>
                      <LfpVQChart data={lfpData.vq_curves} />
                    </div>
                  </div>

                  <div className="p-3 border border-border rounded-lg bg-card">
                    <div className="mb-2 text-xs font-mono font-medium text-foreground">
                      {t.cyclers.dqdvTitle}
                    </div>
                    <LfpDQDVChart data={lfpData.dqdv_curve} />
                  </div>
                </div>
              )}

              {/* REGIME 2: GITT TITRATION (Diffusion Kinetics & Equilibrium OCV) */}
              {selectedRegime === "gitt" && (
                <div className="p-3 border border-border rounded-lg bg-card">
                  <div className="mb-2 text-xs font-mono font-medium text-foreground">
                    {t.cyclers.gittTitle}
                  </div>
                  <LfpGittChart
                    pulses={lfpData.gitt_pulses ?? []}
                    timeline={lfpData.gitt_timeline ?? []}
                  />
                </div>
              )}

              {/* REGIME 3: DYNAMIC REAL-WORLD EV DRIVE CYCLE */}
              {selectedRegime === "drive" && (
                <div className="p-3 border border-border rounded-lg bg-card">
                  <div className="mb-2 text-xs font-mono font-medium text-foreground">
                    {t.cyclers.driveTitle}
                  </div>
                  <LfpDriveProfileChart data={lfpData.drive_profile ?? []} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}
