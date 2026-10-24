"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { BTMSPanel } from "@/components/battery/BTMSPanel";

export default function BTMSPage() {
  const pageTitle = "Gestion Thermique BTMS — Simulation Plaque Froide & Équilibre de Bernardi";
  const pageDesc = "Tableau des États Transitoires · Modèle d'Échauffement 1D Couplé (SciPy RK45) · Convection Dittus-Boelter (Eau-Glycol 50/50)";

  return (
    <BaseLayout title={pageTitle} description={pageDesc}>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <BTMSPanel />
      </div>
    </BaseLayout>
  );
}
