"use client";

import * as React from "react";
import { Joyride, STATUS, type Step, type EventData } from "react-joyride";
import { useLocation } from "@tanstack/react-router";
import { useTour } from "./tour-context";
import { CustomJoyrideTooltip } from "./custom-joyride-tooltip";
import { activateTourTab } from "./tour-utils";

const EmptyBeacon = () => null;

const generalPlatformStep: Step = {
  target: "body",
  placement: "center",
  content:
    "Bienvenue sur la plateforme LFP : suite logicielle d'ingénierie dédiée à la qualification industrielle des cellules LiFePO₄ (norme IATF 16949), à l'analyse électrochimique (courbes de cyclage, dQ/dV, GITT) et à la simulation thermique des packs batteries (norme SAE J2464).",
  skipBeacon: true,
};

export function GuidedTour() {
  const { isTourRunning, stopTour, checkAutoStart } = useTour();
  const [mounted, setMounted] = React.useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const pageKey = React.useMemo(() => {
    if (pathname.includes("/cyclers")) return "cyclers";
    if (pathname.includes("/btms")) return "btms";
    if (
      pathname.includes("/formation") ||
      pathname.includes("/dashboard") ||
      pathname === "/" ||
      pathname.endsWith("/en") ||
      pathname.endsWith("/fr")
    ) {
      return "formation";
    }
    return "";
  }, [pathname]);

  React.useEffect(() => {
    setMounted(true);
    if (pageKey) {
      const timer = setTimeout(() => {
        checkAutoStart(pageKey);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pageKey, checkAutoStart]);

  const steps = React.useMemo<Step[]>(() => {
    if (pageKey === "cyclers") {
      return [
        generalPlatformStep,
        {
          target: '[data-tour="cyclers-kpis"]',
          content:
            "Fiche technique LFP 50Ah : spécifie la fenêtre de tension de travail (3.20V - 3.35V) et les limites de potentiel électrochimique de la cellule.",
          skipBeacon: true,
          placement: "bottom",
        },
        {
          target: '[data-tour="lfp-steps-table"]',
          content:
            "Protocole d'essais en 12 étapes : cliquez sur une ligne pour dérouler son bilan énergétique (Wh/kg), son régime de courant et sa durée d'essai.",
          skipBeacon: true,
          placement: "bottom",
        },
        {
          target: '[data-tour="cyclers-tabs"]',
          content:
            "Sélecteur de régimes : compare le comportement quasi-statique (C/12), la cinétique de diffusion du lithium (GITT) ou les cycles dynamiques routiers (VE).",
          skipBeacon: true,
          placement: "bottom",
        },
        {
          target: '[data-tour="cyclers-charts"]',
          content:
            "Courbes physiques : analyse la dérivée différentielle dQ/dV pour identifier les plateaux redox (pic à 3.42V) et surveille l'évolution tension-capacité V(Q).",
          skipBeacon: true,
          placement: "top",
        },
        {
          target: '[data-tour="header-datasets"]',
          content:
            "Export des cyclers : téléchargez les fichiers CSV bruts originaux (3.5 à 18 Mo) ou les séries traitées pour vos modèles de batterie.",
          skipBeacon: true,
          placement: "bottom",
        },
      ];
    }

    if (pageKey === "btms") {
      return [
        generalPlatformStep,
        {
          target: '[data-tour="btms-kpis"]',
          content:
            "Critères de sécurité SAE J2464 : surveille le gradient transitoire cœur-surface (ΔT) avec alarme immédiate en cas de dépassement du seuil critique de 3.0°C.",
          skipBeacon: true,
          placement: "bottom",
        },
        {
          target: '[data-tour="btms-controls"]',
          content:
            "Solveur d'équations différentielles (ODE) : réglez le débit de caloporteur et le régime de courant (jusqu'à 3C) pour observer la réponse thermique en direct.",
          skipBeacon: true,
          placement: "bottom",
        },
        {
          target: '[data-tour="header-datasets"]',
          content:
            "Données thermiques : téléchargez les profils de température simulés et les métriques de dissipation thermique au format CSV ou JSON.",
          skipBeacon: true,
          placement: "bottom",
        },
      ];
    }

    // Default: formation
    return [
      generalPlatformStep,
      {
        target: '[data-tour="formation-kpis"]',
        content:
          "Synthèse de qualification du lot : surveille le rendement d'admission en pack automobile (Grade A) et l'indice de capabilité procédé Six-Sigma (Cpk = 1.42).",
        skipBeacon: true,
        placement: "bottom",
      },
      {
        target: '[data-tour="batch-ledger"]',
        content:
          "Registre métrologique : cliquez sur une cellule pour inspecter son audit complet (capacité nominale Ah, résistance DCIR et auto-décharge K-value).",
        skipBeacon: true,
        placement: "bottom",
      },
      {
        target: '[data-tour="chart-screening"]',
        content:
          "Matrice de tri 4 quadrants (norme IATF 16949) : croise l'auto-décharge (K) et la résistance interne (DCIR) pour isoler les cellules présentant un risque de micro-court-circuit dendritique.",
        skipBeacon: true,
        placement: "top",
        before: async () => {
          await activateTourTab('[data-tour="tab-screening"]');
        },
      },
      {
        target: '[data-tour="chart-spc"]',
        content:
          "Carte de contrôle statistique SPC Shewhart : suit la capacité déchargée canal par canal face à la moyenne (X̄) et aux limites ±3σ (UCL/LCL) pour vérifier la capabilité Six-Sigma (Cpk > 1.33).",
        skipBeacon: true,
        placement: "top",
        before: async () => {
          await activateTourTab('[data-tour="tab-spc"]');
        },
      },
      {
        target: '[data-tour="header-datasets"]',
        content:
          "Centre d'exportation : téléchargez les données brutes de production ou les métrologies de qualification (CSV / JSON) pour vos benchmarks.",
        skipBeacon: true,
        placement: "bottom",
      },
    ];
  }, [pageKey]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, step } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
    }

    if (type === "step:before") {
      const targetSelector = typeof step?.target === "string" ? step.target : "";
      if (targetSelector.includes("chart-spc")) {
        void activateTourTab('[data-tour="tab-spc"]');
      } else if (targetSelector.includes("chart-screening")) {
        void activateTourTab('[data-tour="tab-screening"]');
      }
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={isTourRunning}
      continuous
      scrollToFirstStep={false}
      beaconComponent={EmptyBeacon}
      options={{
        skipBeacon: true,
      }}
      tooltipComponent={CustomJoyrideTooltip}
      onEvent={handleJoyrideCallback}
      styles={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
      }}
    />
  );
}
