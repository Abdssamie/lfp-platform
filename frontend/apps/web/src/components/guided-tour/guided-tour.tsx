"use client";

import * as React from "react";
import { Joyride, STATUS, ACTIONS, EVENTS, type Step, type EventData } from "react-joyride";
import { useLocation } from "@tanstack/react-router";
import { useTour } from "./tour-context";
import { CustomJoyrideTooltip } from "./custom-joyride-tooltip";
import { activateTourTab } from "./tour-utils";
import { usePlatformTranslation } from "@/lib/translations";

const EmptyBeacon = () => null;

export type PageKey = "formation" | "cyclers" | "btms" | "standards";

export interface TourStep extends Step {
  page: PageKey;
  title: string;
  beforeStep?: () => Promise<void>;
  spotlightClicks?: boolean;
}

export function getPageTourSteps(page: PageKey, isFr: boolean): TourStep[] {
  switch (page) {
    case "formation":
      return [
        {
          page: "formation",
          target: '[data-tour="formation-kpis"]',
          placement: "bottom",
          title: isFr ? "Synthèse Contrôle Qualité & SPC" : "Quality Control & SPC Summary",
          content: isFr
            ? "Ligne de Formation LFP — Suivi de qualification du lot pilote : surveille en temps réel le taux de conformité automobile (Grade A : 87.5%) et l'indice de capabilité procédé Six-Sigma (Cpk = 1.42 · Objectif IATF > 1.33)."
            : "LFP Formation Line — Pilot batch qualification summary: tracks real-time automotive admittance yield (Grade A: 87.5%) and Six-Sigma process capability index (Cpk = 1.42 · IATF target > 1.33).",
          skipBeacon: true,
        },
        {
          page: "formation",
          target: '[data-tour="batch-ledger"]',
          placement: "bottom",
          title: isFr ? "Registre Métrologique des 24 Canaux" : "24-Channel Metrology Ledger",
          content: isFr
            ? "Registre métrologique haute densité des 24 canaux : filtrez par grade (A, B, Rebut) et cliquez sur une ligne pour dérouler son audit détaillé (capacité nominale Ah, résistance DCIR 10s et chute de relaxation K-value mV/j)."
            : "24-Channel high-density metrology ledger: filter by grade (A, B, Scrap) and click any row to inspect complete cell audit data (nominal capacity Ah, 10s DCIR resistance, and voltage relaxation drop K-value mV/day).",
          skipBeacon: true,
        },
        {
          page: "formation",
          target: '[data-tour="chart-screening"]',
          placement: "top",
          title: isFr ? "Matrice de Tri 4 Quadrants IATF 16949" : "IATF 16949 4-Quadrant Sorting Matrix",
          content: isFr
            ? "Matrice de tri 4 quadrants : croise l'auto-décharge (K-value) et la résistance interne (DCIR) pour isoler les cellules présentant un risque de micro-court-circuit dendritique ou d'échauffement Joule excessif."
            : "4-Quadrant sorting matrix: correlates self-discharge rate (K-value) with internal resistance (DCIR) to isolate cells with micro-short circuit hazards or excessive Joule heating.",
          skipBeacon: true,
          beforeStep: () => activateTourTab('[data-tour="tab-screening"]').then(() => undefined),
        },
        {
          page: "formation",
          target: '[data-tour="chart-spc"]',
          placement: "top",
          title: isFr ? "Carte de Contrôle SPC Shewhart" : "Shewhart SPC Run Chart",
          content: isFr
            ? "Carte de contrôle statistique Shewhart : suit la capacité déchargée canal par canal face à la moyenne X̄ et aux limites de contrôle ±3σ (UCL/LCL) pour garantir la stabilité Six-Sigma de la ligne de formation."
            : "Statistical process control run chart: tracks discharged capacity channel-by-channel against average X̄ and ±3σ control limits (UCL/LCL) demonstrating Six-Sigma manufacturing stability.",
          skipBeacon: true,
          beforeStep: () => activateTourTab('[data-tour="tab-spc"]').then(() => undefined),
        },
      ];

    case "cyclers":
      return [
        {
          page: "cyclers",
          target: '[data-tour="cyclers-kpis"]',
          placement: "bottom",
          title: isFr ? "Fiche Technique & Paramètres d'Essai" : "Test Datasheet & Specimen Parameters",
          content: isFr
            ? "Laboratoire de Cyclage — Fiche d'essai cellule LFP 50Ah LG Chem : spécifie la fenêtre de tension électrochimique (3.20V–3.35V) et la fraction du plateau biphasé caractéristique de la chimie LiFePO₄."
            : "Cycler Laboratory — LG Chem 50Ah LFP test datasheet: specifies the electrochemical voltage window (3.20V–3.35V) and two-phase plateau fraction characteristic of LiFePO₄ chemistry.",
          skipBeacon: true,
        },
        {
          page: "cyclers",
          target: '[data-tour="lfp-steps-table"]',
          placement: "bottom",
          title: isFr ? "Protocole d'Essais en 12 Étapes" : "12-Step Test Protocol",
          content: isFr
            ? "Protocole de cyclage complet (148.1h) : séquences quasi-statiques C/12, benchmarks C/6, titration galvanostatique GITT et cycles routiers VE. Cliquez sur une ligne pour dérouler son bilan d'énergie spécifique (Wh/kg)."
            : "Complete cycling protocol (148.1h): C/12 quasi-static runs, C/6 benchmark tests, GITT galvanostatic titration, and dynamic EV profiles. Click a row to expand its specific energy balance (Wh/kg).",
          skipBeacon: true,
        },
        {
          page: "cyclers",
          target: '[data-tour="cyclers-tabs"]',
          placement: "bottom",
          title: isFr ? "Sélecteur de Régimes Électrochimiques" : "Electrochemical Regime Selector",
          content: isFr
            ? "Basculez entre le régime à courant constant (Courbes V(t), V(Q) et dQ/dV), la cinétique de diffusion du lithium par titration GITT (58 impulsions), et le cycle routier dynamique de véhicule électrique."
            : "Switch between constant current regimes (V(t), V(Q), and dQ/dV curves), lithium diffusion kinetics via GITT titration (58 pulses), and dynamic electric vehicle drive cycles.",
          skipBeacon: true,
        },
        {
          page: "cyclers",
          target: '[data-tour="cyclers-charts"]',
          placement: "top",
          title: isFr ? "Analyses Graphiques & Télémétrie" : "Graphical Analytics & Telemetry",
          content: isFr
            ? "Visualisation des courbes : le chronogramme V(t) & I(t) valide la réponse dynamique, le plateau V(Q) met en évidence la transition biphasique, et la dérivée dQ/dV révèle le pic redox à 3.42V."
            : "Graphical curve analytics: V(t) & I(t) telemetry validates dynamic response, V(Q) highlights the two-phase plateau, and differential capacity dQ/dV reveals the redox phase transition at 3.42V.",
          skipBeacon: true,
        },
      ];

    case "btms":
      return [
        {
          page: "btms",
          target: '[data-tour="btms-controls"]',
          placement: "bottom",
          title: isFr ? "Paramètres de Refroidissement & Solveur RK45" : "BTMS Cooling Parameters & RK45 Solver",
          content: isFr
            ? "Modèle couplé 1D à deux états & Bilan d'énergie de Bernardi : configurez le régime C, la température d'entrée du fluide caloporteur (Eau-Glycol 50/50), le débit (LPM) et la capacité nominale."
            : "Coupled 1D two-state model & Bernardi energy balance: configure C-rate, cold-plate coolant inlet temperature (50/50 Water-Glycol), flow rate (LPM), and nominal cell capacity.",
          skipBeacon: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-run-btn"]',
          placement: "bottom",
          title: isFr ? "Lancer le Calcul Thermique" : "Launch Thermal Simulation",
          content: isFr
            ? "Cliquez sur ce bouton « Lancer la Simulation » pour exécuter le solveur différentiel RK45. L'étape suivante du guide s'activera automatiquement dès que les résultats seront calculés."
            : "Click this 'Run Simulation' button to execute the RK45 differential ODE solver. The next step of the guide will activate automatically once results are calculated.",
          skipBeacon: true,
          spotlightClicks: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-kpis"]',
          placement: "bottom",
          title: isFr ? "Critères de Sécurité Norme SAE J2464" : "SAE J2464 Safety Criteria",
          content: isFr
            ? "Indicateurs de conformité thermique : surveille le gradient transitoire cœur-surface (ΔT < 3.0°C) et la température maximale de contact (T_surf < 45.0°C) pour prévenir tout risque d'emballement thermique."
            : "Thermal compliance metrics: monitors transient core-to-surface gradient (ΔT < 3.0°C) and peak surface temperature (T_surf < 45.0°C) to safeguard against thermal runaway.",
          skipBeacon: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-table"]',
          placement: "top",
          title: isFr ? "Tableau des États Transitoires" : "Transient States ODE Table",
          content: isFr
            ? "Tableau résolu pas à pas : inspecte la trajectoire temporelle (s), l'état de charge SOC, l'évolution thermique (T_cœur, T_surface, ΔT) et les flux thermiques instantanés (Pertes Joule + Flux entropique)."
            : "Step-by-step resolved table: inspects physical time progression (s), state of charge (SOC), thermal profile (T_core, T_surface, ΔT), and instantaneous heat generation (Joule losses + entropic flux).",
          skipBeacon: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-charts"]',
          placement: "top",
          title: isFr ? "Dynamique Thermique & Bilan de Flux" : "Thermal Dynamics & Heat Flux Balance",
          content: isFr
            ? "Graphiques d'échauffement : visualisez la divergence de température cœur/surface face au refroidissement convectif (Dittus-Boelter), ainsi que la décomposition du flux de chaleur selon l'équation de Bernardi."
            : "Thermal rise curves: visualize core and surface temperature divergence against convective cold-plate cooling (Dittus-Boelter), alongside Bernardi heat generation breakdown.",
          skipBeacon: true,
        },
      ];

    case "standards":
      return [
        {
          page: "standards",
          target: '[data-tour="standards-iatf"]',
          placement: "bottom",
          title: isFr ? "Norme Automotive IATF 16949" : "IATF 16949 Automotive Standard",
          content: isFr
            ? "Critères de qualification en gigafactory : impose un indice de capabilité procédé Cpk > 1.33, un taux d'auto-décharge K-value < 2.0 mV/jour après 14 jours de vieillissement à 25°C, et une résistance DCIR < 35.0 mΩ sous impulsion 10s."
            : "Gigafactory qualification criteria: enforces process capability Cpk > 1.33, self-discharge K-value < 2.0 mV/day after 14-day aging at 25°C, and 10s pulse DCIR < 35.0 mΩ.",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="standards-iec"]',
          placement: "bottom",
          title: isFr ? "Norme IEC 62660-1 (Cellules Li-ion VE)" : "IEC 62660-1 Standard (EV Li-ion Cells)",
          content: isFr
            ? "Méthodes d'essais sous cyclage sévère pour véhicules électriques routiers : encadre les protocoles de référence (C/12, C/6) et fixe le seuil de fin de vie batterie EOL à 80% de rétention de capacité (40.0 Ah)."
            : "Severe cycling test methodologies for electric road vehicles: defines reference test regimes (C/12, C/6) and sets the End-Of-Life (EOL) boundary at 80% capacity retention (40.0 Ah).",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="standards-sae"]',
          placement: "bottom",
          title: isFr ? "Norme SAE J2464 (Sécurité & Abus Thermique)" : "SAE J2464 Standard (Thermal Safety & Abuse)",
          content: isFr
            ? "Sécurité des modules et packs batteries : impose des limites strictes sur le gradient thermique transitoire (ΔT < 3.0°C) pour garantir l'uniformité thermique du pack sous fortes sollicitations de puissance."
            : "Battery pack and module safety: specifies strict limits on transient thermal gradient (ΔT < 3.0°C) to ensure pack temperature uniformity under heavy fast-charging or peak acceleration.",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="header-datasets"]',
          placement: "bottom",
          title: isFr ? "Centre d'Exportation & Données" : "Data & Audit Export Center",
          content: isFr
            ? "Exportation directe : accédez à tout moment aux fichiers CSV bruts de cyclage et aux registres de qualification métrologique pour vos rapports d'audit qualité et analyses électrochimiques."
            : "Direct export center: download raw cycling CSV logs and metrology qualification spreadsheets anytime for quality audits and independent electrochemical analysis.",
          skipBeacon: true,
        },
      ];
  }
}

export function pageForPath(pathname: string): PageKey {
  if (pathname.includes("/cyclers")) return "cyclers";
  if (pathname.includes("/btms")) return "btms";
  if (pathname.includes("/standards")) return "standards";
  return "formation";
}

export function GuidedTour() {
  const { isFr } = usePlatformTranslation();
  const location = useLocation();
  const currentPage = pageForPath(location.pathname);

  // Each page receives only its own dedicated guide steps
  const steps = React.useMemo(
    () => getPageTourSteps(currentPage, isFr),
    [currentPage, isFr]
  );

  const {
    isTourRunning,
    tourStepIndex,
    stopTour,
    setTourStepIndex,
    checkAutoStart,
  } = useTour();

  const [mounted, setMounted] = React.useState(false);

  // Stop tour if user navigates away to a different workstation page
  const prevPageRef = React.useRef(currentPage);
  React.useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      if (isTourRunning) {
        stopTour();
      }
      prevPageRef.current = currentPage;
    }
  }, [currentPage, isTourRunning, stopTour]);

  // First-time landing check (auto-starts once on initial formation line entry)
  React.useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      checkAutoStart(currentPage);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, checkAutoStart]);

  const handleCallback = React.useCallback(
    async (data: EventData) => {
      const { status, action, index, type } = data;

      // Handle tour exit, close, skip or finish
      if (
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED ||
        action === ACTIONS.CLOSE ||
        action === ACTIONS.STOP ||
        action === ACTIONS.SKIP
      ) {
        stopTour();
        return;
      }

      // Handle step advance / rewind within the current page
      if (type === EVENTS.STEP_AFTER) {
        const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;

        if (nextIndex < 0 || nextIndex >= steps.length) {
          stopTour();
          return;
        }

        const nextStep = steps[nextIndex];
        if (nextStep?.beforeStep) {
          await nextStep.beforeStep();
        }
        setTourStepIndex(nextIndex);
        return;
      }

      // Pre-step setup hook for tabs or custom UI state
      if (type === EVENTS.STEP_BEFORE) {
        const currentStep = steps[index];
        if (currentStep?.beforeStep) {
          await currentStep.beforeStep();
        }
      }
    },
    [stopTour, setTourStepIndex, steps]
  );

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={isTourRunning}
      stepIndex={tourStepIndex}
      continuous
      scrollToFirstStep={false}
      beaconComponent={EmptyBeacon}
      options={{
        skipBeacon: true,
      }}
      tooltipComponent={CustomJoyrideTooltip}
      onEvent={handleCallback}
      styles={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.72)",
        },
      }}
    />
  );
}
