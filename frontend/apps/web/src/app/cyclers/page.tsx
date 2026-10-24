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

export default function CyclersPage() {
  const [lfpData, setLfpData] = React.useState<LfpDatasetResponse>(MOCK_LFP);
  const [selectedRegime, setSelectedRegime] = React.useState<"cc" | "gitt" | "drive">("cc");
  const [selectedStepIndex, setSelectedStepIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    void fetchLfpDataset().then((res) => {
      if (res) setLfpData(res);
    });
  }, []);

  const pageTitle = "Laboratoire de Cyclage — Caractérisation LFP 50Ah";
  const pageDesc = "Protocoles Haute Précision : Pseudo-OCV (C/12 & C/6) · Cinétique GITT (118.4h) · Cycles Dynamiques VE · LG Chem Prismatic LiFePO₄ / Graphite";

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-5">
        {/* Sleek Context & KPI Strip */}
        <div
          data-tour="cyclers-kpis"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">Spécimen d'Essai:</span>
            <Badge variant="outline" className="font-mono text-xs">
              LG Chem 50Ah (Prismatique)
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              LiFePO₄ / Graphite
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Plateau Biphasique: {lfpData.metadata.plateau_fraction_pct.toFixed(1)}% (3.20V – 3.35V)
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Fenêtre: {lfpData.metadata.min_voltage_v.toFixed(2)}V – {lfpData.metadata.max_voltage_v.toFixed(2)}V
            </Badge>
            <Badge variant="outline" className="font-mono text-xs gap-1">
              <CheckCircle2 className="size-3" />
              12 Étapes Validées (148.1h)
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="size-4" />
                    Analyses Graphiques &amp; Validation Électrochimique
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Examinez les courbes caractéristiques selon le mode d'essai sélectionné.
                  </CardDescription>
                </div>

                <div data-tour="cyclers-tabs">
                  <Tabs
                    value={selectedRegime}
                    onValueChange={(val) => setSelectedRegime(val as typeof selectedRegime)}
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="cc" className="text-xs px-2.5 cursor-pointer gap-1.5 font-mono">
                        <Layers className="size-3.5" />
                        Pseudo-OCV &amp; dQ/dV
                      </TabsTrigger>
                      <TabsTrigger value="gitt" className="text-xs px-2.5 cursor-pointer gap-1.5 font-mono">
                        <Zap className="size-3.5" />
                        Titration GITT 0.33C
                      </TabsTrigger>
                      <TabsTrigger value="drive" className="text-xs px-2.5 cursor-pointer gap-1.5 font-mono">
                        <Activity className="size-3.5" />
                        Profil VE Dynamique
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
                        Chronogramme V(t) &amp; I(t) — Cycle C/12 (24.5h)
                      </div>
                      <LfpTelemetryChart data={lfpData.telemetry} />
                    </div>

                    <div className="p-3 border border-border rounded-lg bg-card">
                      <div className="mb-2 text-xs font-mono font-medium text-foreground">
                        Plateau de Tension Biphasique V(Q)
                      </div>
                      <LfpVQChart data={lfpData.vq_curves} />
                    </div>
                  </div>

                  <div className="p-3 border border-border rounded-lg bg-card">
                    <div className="mb-2 text-xs font-mono font-medium text-foreground">
                      Dérivée Capacitive dQ/dV — Transition de Phase Redox à 3.42V
                    </div>
                    <LfpDQDVChart data={lfpData.dqdv_curve} />
                  </div>
                </div>
              )}

              {/* REGIME 2: GITT TITRATION (Diffusion Kinetics & Equilibrium OCV) */}
              {selectedRegime === "gitt" && (
                <div className="p-3 border border-border rounded-lg bg-card">
                  <div className="mb-2 text-xs font-mono font-medium text-foreground">
                    Cinétique GITT (58 Impulsions sur 118.4 Heures &amp; Diffusion Li⁺)
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
                    Cycle Routier Dynamique VE (Profil 1 — 5.22h)
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
