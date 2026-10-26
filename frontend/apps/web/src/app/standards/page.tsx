"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Layers, Flame } from "lucide-react";
import { usePlatformTranslation } from "@/lib/translations";

export default function StandardsPage() {
  const { t } = usePlatformTranslation();

  return (
    <BaseLayout
      title={t.standards.pageTitle}
      description={t.standards.pageDesc}
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* IATF 16949 Card */}
        <Card data-tour="standards-iatf">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  {t.standards.iatfCardTitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                <CheckCircle2 className="size-3" />
                {t.standards.iatfBadge}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t.standards.iatfDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.cpkCardTitle}</span>
                <p className="text-muted-foreground">{t.standards.cpkCardDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.kValueCardTitle}</span>
                <p className="text-muted-foreground">{t.standards.kValueCardDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.dcirCardTitle}</span>
                <p className="text-muted-foreground">{t.standards.dcirCardDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IEC 62660-1 Card */}
        <Card data-tour="standards-iec">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  {t.standards.iecCardTitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                {t.standards.iecBadge}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t.standards.iecDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.iecRegimesTitle}</span>
                <p className="text-muted-foreground">{t.standards.iecRegimesDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.iecEolTitle}</span>
                <p className="text-muted-foreground">{t.standards.iecEolDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.iecDqdvTitle}</span>
                <p className="text-muted-foreground">{t.standards.iecDqdvDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAE J2464 Card */}
        <Card data-tour="standards-sae">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  {t.standards.saeCardTitle}
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                {t.standards.saeBadge}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t.standards.saeDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.saeGradientTitle}</span>
                <p className="text-muted-foreground">{t.standards.saeGradientDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.saePeakTitle}</span>
                <p className="text-muted-foreground">{t.standards.saePeakDesc}</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">{t.standards.saeFluidTitle}</span>
                <p className="text-muted-foreground">{t.standards.saeFluidDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
