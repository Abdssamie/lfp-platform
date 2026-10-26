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
  Database,
  Layers,
  Zap,
  Activity,
  ShieldCheck,
  HardDrive,
} from "lucide-react";

import { MOCK_LFP, MOCK_BATCH } from "@/lib/mock-data";
import { fetchLfpDataset, fetchBatchCurrent } from "@/lib/api";
import type { LfpDatasetResponse, BatchSummaryResponse } from "@/types/api";
import { usePlatformTranslation } from "@/lib/translations";
import {
  exportStepsToCsv,
  exportFormationLotToCsv,
  exportVqCurvesToCsv,
  exportDqdvToCsv,
  exportGittToCsv,
  exportDriveProfileToCsv,
  downloadCsvFile,
  downloadRawServerFile,
} from "@/lib/dataset-export";

interface DatasetDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatasetDownloadModal({ open, onOpenChange }: DatasetDownloadModalProps) {
  const { t } = usePlatformTranslation();
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
      }, 2000);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl max-h-[85dvh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl sm:rounded-xl">
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-border bg-muted/40 shrink-0">
              <Database className="size-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {t.datasetsModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t.datasetsModal.desc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <Tabs defaultValue="processed" className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-sm h-9 p-1 bg-muted/60 mb-4 rounded-lg">
              <TabsTrigger value="processed" className="text-xs font-mono cursor-pointer py-1 truncate px-2">
                {t.datasetsModal.tabProcessed}
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs font-mono cursor-pointer py-1 truncate px-2">
                {t.datasetsModal.tabRaw}
              </TabsTrigger>
            </TabsList>

            {/* =========================================================================
                TAB 1: PROCESSED & SYNTHESIZED EXPERIMENTAL DATA (CSV ONLY)
               ========================================================================= */}
            <TabsContent value="processed" className="space-y-2.5 mt-0">
              {/* Option 1: Protocol Steps */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <Layers className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.stepsTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        {t.datasetsModal.stepsBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.stepsDesc}
                    </p>
                  </div>
                </div>
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
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  {downloadedKey === "steps_csv" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>CSV</span>
                </Button>
              </div>

              {/* Option 2: Electrochemical V(Q) and dQ/dV */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <Activity className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.vqTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        {t.datasetsModal.vqBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.vqDesc}
                    </p>
                  </div>
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
                    className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-2.5"
                  >
                    {downloadedKey === "vq_csv" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Download className="size-3.5" />
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
                    className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-2.5"
                  >
                    {downloadedKey === "dqdv_csv" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    <span>dQ/dV CSV</span>
                  </Button>
                </div>
              </div>

              {/* Option 3: GITT Kinetics */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <Zap className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.gittTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        {t.datasetsModal.gittBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.gittDesc}
                    </p>
                  </div>
                </div>
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
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  {downloadedKey === "gitt_csv" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>CSV</span>
                </Button>
              </div>

              {/* Option 4: Real-world EV Drive Profile */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <Activity className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.driveTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        {t.datasetsModal.driveBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.driveDesc}
                    </p>
                  </div>
                </div>
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
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  {downloadedKey === "drive_csv" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>CSV</span>
                </Button>
              </div>

              {/* Option 5: SPC Formation Lot (24 Channels) */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <ShieldCheck className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.spcTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        {t.datasetsModal.spcBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.spcDesc}
                    </p>
                  </div>
                </div>
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
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  {downloadedKey === "spc_csv" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span>CSV</span>
                </Button>
              </div>
            </TabsContent>

            {/* =========================================================================
                TAB 2: RAW EXPERIMENTAL CYCLER FILES FROM BENCH (Original CSV)
               ========================================================================= */}
            <TabsContent value="raw" className="space-y-2.5 mt-0">
              <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground font-mono">
                {t.datasetsModal.rawNotice}
              </div>

              {/* Raw File 1: CC 0.08C */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <HardDrive className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.rawCcC12Title}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        8.2 Mo
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.rawCcC12Desc}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("cc_c12", "LG_Chem_LFP_50Ah_CC_0_08C_FullCycle.csv")
                  }
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </Button>
              </div>

              {/* Raw File 2: CC 0.17C */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <HardDrive className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.rawCcC6Title}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        4.0 Mo
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.rawCcC6Desc}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("cc_c6", "LG_Chem_LFP_50Ah_CC_0_17C_Benchmark.csv")
                  }
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </Button>
              </div>

              {/* Raw File 3: GITT 0.33C */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <HardDrive className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.rawGittTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        3.5 Mo
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.rawGittDesc}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("gitt_033c", "LG_Chem_LFP_50Ah_GITT_0_33C_Titration.csv")
                  }
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </Button>
              </div>

              {/* Raw File 4: Dynamic EV Profile */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-1.5 rounded-md border border-border/70 bg-muted/40 shrink-0 mt-0.5">
                    <HardDrive className="size-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {t.datasetsModal.rawDriveTitle}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4.5">
                        1.2 Mo
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t.datasetsModal.rawDriveDesc}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadRawServerFile("drive_profile", "LG_Chem_LFP_50Ah_EV_DriveProfile_1.csv")
                  }
                  className="h-8 text-xs font-mono cursor-pointer gap-1.5 px-3 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>CSV</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
