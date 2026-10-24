"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Check,
  FileSpreadsheet,
  FileCode,
  Database,
  Layers,
  Zap,
  Activity,
  ShieldCheck,
  HardDrive,
  Sparkles,
} from "lucide-react";

import { MOCK_LFP, MOCK_BATCH } from "@/lib/mock-data";
import { fetchLfpDataset, fetchBatchCurrent } from "@/lib/api";
import type { LfpDatasetResponse, BatchSummaryResponse } from "@/types/api";
import {
  exportStepsToCsv,
  exportFormationLotToCsv,
  exportVqCurvesToCsv,
  exportDqdvToCsv,
  exportGittToCsv,
  exportDriveProfileToCsv,
  downloadJsonFile,
  downloadCsvFile,
  downloadRawServerFile,
  exportFullUnifiedBundle,
} from "@/lib/dataset-export";

interface DatasetDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatasetDownloadModal({ open, onOpenChange }: DatasetDownloadModalProps) {
  const [lfpData, setLfpData] = React.useState<LfpDatasetResponse>(MOCK_LFP);
  const [batchData, setBatchData] = React.useState<BatchSummaryResponse>(MOCK_BATCH);
  const [downloadedKey, setDownloadedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      void fetchLfpDataset().then((res) => {
        if (res) setLfpData(res);
      });
      void fetchBatchCurrent().then((res) => {
        if (res) setBatchData(res);
      });
    }
  }, [open]);

  const handleDownload = (key: string, downloadFn: () => void) => {
    try {
      downloadFn();
      setDownloadedKey(key);
      setTimeout(() => {
        setDownloadedKey((current) => (current === key ? null : current));
      }, 2200);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md border border-border bg-muted/40">
              <Database className="size-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Export &amp; Référence des Données Électrochimiques
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Spécimen : Cellule prismatique LG Chem 50Ah LiFePO₄ &amp; Lot de formation 24 canaux.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 overflow-y-auto space-y-4">
          <Tabs defaultValue="processed" className="w-full">
            <TabsList className="grid grid-cols-2 h-8 w-full max-w-sm mb-3">
              <TabsTrigger value="processed" className="text-xs font-mono cursor-pointer">
                Données Traitées &amp; Métrologie
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs font-mono cursor-pointer">
                Banc d'Essai Brut (Raw CSV)
              </TabsTrigger>
            </TabsList>

            {/* =========================================================================
                TAB 1: PROCESSED & SYNTHESIZED EXPERIMENTAL DATA (CSV / JSON)
               ========================================================================= */}
            <TabsContent value="processed" className="space-y-3 mt-0">
              {/* Option 1: Protocol Steps */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Protocole d'Essais Industriel (12 Étapes)
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      148.1h de tests
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Étapes quasi-statiques C/12, benchmarks C/6, titration GITT et profils dynamiques VE (durées, courants, énergies, densité Wh/kg).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("steps_csv", () =>
                        downloadCsvFile(
                          "LG_Chem_50Ah_Protocol_12_Steps.csv",
                          exportStepsToCsv(lfpData.steps)
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "steps_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("steps_json", () =>
                        downloadJsonFile("LG_Chem_50Ah_Protocol_12_Steps.json", lfpData.steps)
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "steps_json" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileCode className="size-3" />
                    )}
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              {/* Option 2: Electrochemical V(Q) and dQ/dV */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Courbes Électrochimiques V(Q) &amp; Dérivée dQ/dV
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      Pic Redox 3.42V
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Tension quasi-équilibre du plateau diphasique LiFePO₄ et différenciation Savitzky-Golay révélant l'hystérèse de transition de phase.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("vq_csv", () =>
                        downloadCsvFile(
                          "LG_Chem_50Ah_VQ_Curves.csv",
                          exportVqCurvesToCsv(lfpData.vq_curves)
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "vq_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>V(Q) CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("dqdv_csv", () =>
                        downloadCsvFile(
                          "LG_Chem_50Ah_dQdV_Derivative.csv",
                          exportDqdvToCsv(lfpData.dqdv_curve)
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "dqdv_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>dQ/dV CSV</span>
                  </Button>
                </div>
              </div>

              {/* Option 3: GITT Kinetics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Cinétique GITT 0.33C &amp; Diffusion Li⁺
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      58 Pulses (118.4h)
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Impulsions de titration galvanostatique, relaxation thermodynamique OCV, résistance d'impulsion Ri et coefficients D_Li⁺ (loi de Fick).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("gitt_csv", () =>
                        downloadCsvFile(
                          "LG_Chem_50Ah_GITT_Kinetics.csv",
                          exportGittToCsv(lfpData.gitt_pulses ?? [])
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "gitt_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("gitt_json", () =>
                        downloadJsonFile(
                          "LG_Chem_50Ah_GITT_Kinetics.json",
                          lfpData.gitt_pulses ?? []
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "gitt_json" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileCode className="size-3" />
                    )}
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              {/* Option 4: Real-world EV Drive Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Cycle Routier Dynamique VE (Profil 1)
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      US06 / WLTP
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Télémétrie dynamique transitoire sur 5.22h sous pointes d'accélération (+47.2A) et régénération au freinage (-25.3A).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("drive_csv", () =>
                        downloadCsvFile(
                          "LG_Chem_50Ah_EV_Drive_Profile_1.csv",
                          exportDriveProfileToCsv(lfpData.drive_profile ?? [])
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "drive_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("drive_json", () =>
                        downloadJsonFile(
                          "LG_Chem_50Ah_EV_Drive_Profile_1.json",
                          lfpData.drive_profile ?? []
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "drive_json" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileCode className="size-3" />
                    )}
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              {/* Option 5: SPC Formation Lot (24 Channels) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Registre Qualité Lot de Formation SPC (24 Canaux)
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      Cpk 1.42 · IATF 16949
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Métrologie cellule par cellule : Capacité réelle, chute de tension K-Value (mV/j), DCIR d'impulsion 10s et affectation des grades A, B et Rebut.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("spc_csv", () =>
                        downloadCsvFile(
                          "LFP_Formation_Lot_SPC_24Ch.csv",
                          exportFormationLotToCsv(batchData.evaluations)
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "spc_csv" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileSpreadsheet className="size-3" />
                    )}
                    <span>CSV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload("spc_json", () =>
                        downloadJsonFile(
                          "LFP_Formation_Lot_SPC_24Ch.json",
                          batchData.evaluations
                        )
                      )
                    }
                    className="h-7 text-xs font-mono cursor-pointer gap-1 px-2.5"
                  >
                    {downloadedKey === "spc_json" ? (
                      <Check className="size-3 text-foreground" />
                    ) : (
                      <FileCode className="size-3" />
                    )}
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              {/* Option 6: Unified Complete Bundle */}
              <div className="p-3 rounded-lg border border-border/80 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                      Pack Analytique Global Complet (Bundle JSON)
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Regroupe l'intégralité des 12 étapes, V-Q, dQ/dV, GITT, profils VE et métrologie 24 canaux dans un schéma JSON unique.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleDownload("full_bundle", () =>
                      exportFullUnifiedBundle(lfpData, batchData)
                    )
                  }
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  {downloadedKey === "full_bundle" ? (
                    <Check className="size-3.5 text-foreground" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>Télécharger Tout (.json)</span>
                </Button>
              </div>
            </TabsContent>

            {/* =========================================================================
                TAB 2: RAW EXPERIMENTAL CYCLER FILES FROM BENCH (Original CSV)
               ========================================================================= */}
            <TabsContent value="raw" className="space-y-3 mt-0">
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs text-muted-foreground font-mono">
                Ces fichiers représentent les séries temporelles complètes acquises directement sur les bancs de cyclage industriels (points bruts V, I, T, temps).
              </div>

              {/* Raw File 1: CC 0.08C */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      cc_0_08.csv — Cyclage C/12 Quasi-Équilibre
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      8.2 Mo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Charge et décharge continues à 0.08C (4.08A) sur 24.5 heures (88k points d'acquisition).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("cc_c12", "LG_Chem_LFP_50Ah_CC_0_08C_FullCycle.csv")
                  }
                  className="h-7 text-xs font-mono cursor-pointer gap-1.5 px-2.5 shrink-0"
                >
                  <Download className="size-3" />
                  <span>Télécharger</span>
                </Button>
              </div>

              {/* Raw File 2: CC 0.17C */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      cc_0_17.csv — Benchmarks C/6 Fast Reference
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      4.0 Mo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cycles de référence à régime double C/6 (8.17A) pour quantification de surtension dynamique.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("cc_c6", "LG_Chem_LFP_50Ah_CC_0_17C_Benchmark.csv")
                  }
                  className="h-7 text-xs font-mono cursor-pointer gap-1.5 px-2.5 shrink-0"
                >
                  <Download className="size-3" />
                  <span>Télécharger</span>
                </Button>
              </div>

              {/* Raw File 3: GITT 0.33C */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      gitt_0_33C.csv — Titration Multi-Impulsions GITT
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      3.5 Mo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Titration galvanostatique intermittente à 0.33C (16.33A) avec relaxations thermodynamiques complètes.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("gitt_033c", "LG_Chem_LFP_50Ah_GITT_0_33C_Titration.csv")
                  }
                  className="h-7 text-xs font-mono cursor-pointer gap-1.5 px-2.5 shrink-0"
                >
                  <Download className="size-3" />
                  <span>Télécharger</span>
                </Button>
              </div>

              {/* Raw File 4: Dynamic EV Drive Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-3.5 text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      profile_1.csv — Profil Roulage VE Haute Dynamique
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5">
                      18.0 Mo
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Sollicitations réelles de conduite automobile : pointes d'accélération +47.2A et freinage régénératif -25.3A.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile(
                      "profile_1",
                      "LG_Chem_LFP_50Ah_EV_Dynamic_Drive_Profile_1.csv"
                    )
                  }
                  className="h-7 text-xs font-mono cursor-pointer gap-1.5 px-2.5 shrink-0"
                >
                  <Download className="size-3" />
                  <span>Télécharger</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
