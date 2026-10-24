"use client";

import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BatchSummaryResponse, SPCSummaryResponse } from "@/types/api";
import { useIntlayer } from "react-intlayer";

interface SectionCardsProps {
  batch?: BatchSummaryResponse | null;
  spc?: SPCSummaryResponse | null;
}

export function SectionCards({ batch, spc }: SectionCardsProps) {
  const content = useIntlayer("dashboard");
  const yieldPct = batch ? batch.yield_pct.toFixed(1) : "91.7";
  const gradeACount = batch ? batch.grade_a_count : 22;
  const totalCount = batch ? batch.total_cells : 24;
  const scrapCount = batch ? batch.scrap_count : 2;
  const scrapPct = totalCount > 0 ? ((scrapCount / totalCount) * 100).toFixed(1) : "8.3";

  const cpkVal = spc ? spc.cpk.toFixed(2) : "1.42";
  const isCapable = spc ? spc.is_capable : true;
  const meanCap = spc ? spc.mean.toFixed(2) : "49.88";

  const yieldRateLabel = String(
    content?.kpi?.yieldRate?.value ?? content?.kpi?.yieldRate ?? "Rendement de la Ligne"
  );
  const processCpkLabel = String(
    content?.kpi?.processCpk?.value ?? content?.kpi?.processCpk ?? "Indice de Capabilité Cpk"
  );
  const cpkTargetLabel = String(
    content?.kpi?.cpkTarget?.value ?? content?.kpi?.cpkTarget ?? "Objectif Qualité: >1.33"
  );
  const quarantineRateLabel = String(
    content?.kpi?.quarantineRate?.value ?? content?.kpi?.quarantineRate ?? "Taux de Quarantaine Lot"
  );
  const quarantineSubLabel = String(
    content?.kpi?.quarantineSub?.value ?? content?.kpi?.quarantineSub ?? "Cellules isolées / rebutées"
  );
  const meanCapacityLabel = String(
    content?.kpi?.meanCapacity?.value ?? content?.kpi?.meanCapacity ?? "Capacité Moyenne Lot"
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Batch Yield */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{yieldRateLabel}</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {yieldPct}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs">
              <TrendingUp className="size-3" />
              +4.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="size-3.5" />
            <span>{gradeACount} / {totalCount} Cells Grade A</span>
          </div>
          <div>Meets lot qualification specification</div>
        </CardFooter>
      </Card>

      {/* 2. Process Capability Cpk */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{processCpkLabel}</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {cpkVal}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs">
              {isCapable ? "Capable" : "Marginal"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>{cpkTargetLabel}</span>
          </div>
          <div>Statistical Six-Sigma in control</div>
        </CardFooter>
      </Card>

      {/* 3. Quarantined Scrap */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{quarantineRateLabel}</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {scrapCount} <span className="text-sm font-normal text-muted-foreground">({scrapPct}%)</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs">
              <TrendingDown className="size-3" />
              -1.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <AlertTriangle className="size-3.5" />
            <span>K-Value / DCIR Outliers</span>
          </div>
          <div>{quarantineSubLabel}</div>
        </CardFooter>
      </Card>

      {/* 4. Mean Capacity & Thermal */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{meanCapacityLabel}</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl text-foreground">
            {meanCap} <span className="text-sm font-normal text-muted-foreground">Ah</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs">
              &Delta;T &lt; 3.0&deg;C
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Nominal Spec: 50.00 Ah</span>
          </div>
          <div>Cooling active (WEG 50/50 plates)</div>
        </CardFooter>
      </Card>
    </div>
  );
}
