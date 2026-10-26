"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { BTMSPanel } from "@/components/battery/BTMSPanel";
import { usePlatformTranslation } from "@/lib/translations";

export default function BTMSPage() {
  const { t } = usePlatformTranslation();
  const pageTitle = t.btms.pageTitle;
  const pageDesc = t.btms.pageDesc;

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <BTMSPanel />
      </div>
    </BaseLayout>
  );
}
