"use client";

import * as React from "react";
import { Joyride, STATUS, ACTIONS, EVENTS, type Step, type EventData } from "react-joyride";
import { useLocation } from "@tanstack/react-router";
import { useTour } from "./tour-context";
import { CustomJoyrideTooltip } from "./custom-joyride-tooltip";
import { activateTourTab, ensureSidebarOpen } from "./tour-utils";
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
          target: '[data-tour="platform-header"]',
          placement: "bottom",
          title: isFr ? "Plateforme d'Ingénierie & Métrologie LFP" : "LFP Battery Analytics & Engineering Platform",
          content: isFr
            ? "Bienvenue sur la plateforme industrielle dédiée aux cellules lithium-fer-phosphate (LFP 50Ah). L'environnement réunit trois modules d'ingénierie interconnectés :\n\n• Contrôle Qualité & SPC : tri automatisé IATF 16949 et détection de micro-courts-circuits (K-value).\n• Cyclage Laboratoire : cinétique GITT, transitions biphasiques dQ/dV et profil VE.\n• Simulation Thermique BTMS : solveur ODE RK45 couplé (pertes Joule + flux de Bernardi).\n\nDécouvrons ensemble les outils de cette ligne de formation."
            : "Welcome to the industrial analytics and metrology platform for lithium iron phosphate (50Ah LFP) cells. The environment brings together three interconnected engineering modules:\n\n• Formation Quality & SPC: automated IATF 16949 sorting and micro-short screening (K-value).\n• Cycler Laboratory: solid-state GITT kinetics, dQ/dV phase transitions, and dynamic EV profiles.\n• BTMS Thermal Simulation: coupled RK45 ODE solver (Joule losses + Bernardi entropic flux).\n\nLet's tour the tools available on this formation line.",
          skipBeacon: true,
        },
        {
          page: "formation",
          target: '[data-tour="formation-kpis"]',
          placement: "bottom",
          title: isFr ? "Indicateurs Clés & Capabilité Lot Pilote" : "Pilot Batch KPIs & Capability",
          content: isFr
            ? "Surveillez en temps réel le taux de conformité automobile (Grade A : 87.5%) et l'indice de capabilité procédé Six-Sigma (Cpk = 1.42 face à l'exigence IATF > 1.33) sur le lot pilote de 24 cellules après 14 jours de repos à 25°C."
            : "Monitors real-time automotive admittance yield (Grade A: 87.5%) and Six-Sigma process capability (Cpk = 1.42 against IATF > 1.33 requirement) across 24 LFP pilot cells after 14-day relaxation.",
          skipBeacon: true,
        },
        {
          page: "formation",
          target: '[data-tour="batch-ledger"]',
          placement: "bottom",
          title: isFr ? "Registre Métrologique des 24 Canaux" : "24-Channel Metrology Ledger",
          content: isFr
            ? "Filtrez par grade (A, B, Rebut) et cliquez sur une ligne pour dérouler son audit détaillé (capacité nominale Ah, résistance DCIR 10s et chute de relaxation K-value mV/j)."
            : "Filter by grade (A, B, Scrap) and click any row to inspect complete cell audit data (nominal capacity Ah, 10s DCIR resistance, and voltage relaxation drop K-value mV/day).",
          skipBeacon: true,
        },
        {
          page: "formation",
          target: '[data-tour="chart-screening"]',
          placement: "top",
          title: isFr ? "Matrice de Tri 4 Quadrants IATF 16949" : "IATF 16949 4-Quadrant Sorting Matrix",
          content: isFr
            ? "Croise l'auto-décharge (K-value) et la résistance interne (DCIR) pour isoler les cellules présentant un risque de micro-court-circuit dendritique ou d'échauffement Joule excessif."
            : "Correlates self-discharge rate (K-value) with internal resistance (DCIR) to isolate cells with micro-short circuit hazards or excessive Joule heating.",
          skipBeacon: true,
          beforeStep: () => activateTourTab('[data-tour="tab-screening"]').then(() => undefined),
        },
        {
          page: "formation",
          target: '[data-tour="chart-spc"]',
          placement: "top",
          title: isFr ? "Carte de Contrôle SPC Shewhart" : "Shewhart SPC Run Chart",
          content: isFr
            ? "Suit la capacité déchargée canal par canal face à la moyenne X̄ et aux limites de contrôle ±3σ (UCL/LCL) pour garantir la stabilité Six-Sigma de la ligne de formation."
            : "Tracks discharged capacity channel-by-channel against average X̄ and ±3σ control limits (UCL/LCL) demonstrating Six-Sigma manufacturing stability.",
          skipBeacon: true,
          beforeStep: () => activateTourTab('[data-tour="tab-spc"]').then(() => undefined),
        },
        {
          page: "formation",
          target: '[data-tour="sidebar-next-workstations"]',
          placement: "right",
          title: isFr
            ? "À Explorer Ensuite : Cyclage & Simulation BTMS"
            : "Explore Next: Cycler Lab & BTMS Simulation",
          content: isFr
            ? "Vous avez découvert la ligne de formation et le tri IATF 16949 !\n\nPoursuivez votre exploration via les 2 autres postes d'ingénierie dans la barre latérale :\n• Cycler Lab Curves : cinétique de diffusion GITT, plateau biphasique dQ/dV (3.42V) et bancs d'essais Neware/Novonix.\n• BTMS Thermal Simulator : modélisation thermique 1D sous charge rapide 3C (solveur RK45 & équilibre de Bernardi)."
            : "You've completed the formation line and IATF 16949 quality tour!\n\nContinue exploring the other 2 engineering workstations in the sidebar:\n• Cycler Lab Curves: solid-state GITT kinetics, dQ/dV phase transitions (3.42V), and authentic Neware/Novonix cycler benches.\n• BTMS Thermal Simulator: coupled 1D electro-thermal modeling under 3C fast charge (RK45 ODE solver & Bernardi heat balance).",
          skipBeacon: true,
          beforeStep: () => ensureSidebarOpen().then(() => undefined),
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
            ? "Spécifie la fenêtre de tension électrochimique (3.20V–3.35V) et la fraction du plateau biphasé caractéristique de la chimie LiFePO₄ sur cellule 50Ah LG Chem."
            : "Specifies the electrochemical voltage window (3.20V–3.35V) and two-phase plateau fraction characteristic of LiFePO₄ chemistry on 50Ah LG Chem cells.",
          skipBeacon: true,
        },
        {
          page: "cyclers",
          target: '[data-tour="lfp-steps-table"]',
          placement: "bottom",
          title: isFr ? "Protocole d'Essais en 12 Étapes" : "12-Step Test Protocol",
          content: isFr
            ? "Explorez 148.1h d'essais réels : séquences quasi-statiques C/12, benchmarks C/6, titration galvanostatique GITT et cycles routiers VE. Cliquez sur une ligne pour dérouler son bilan d'énergie spécifique (Wh/kg)."
            : "Explore 148.1h of real cycling: C/12 quasi-static runs, C/6 benchmark tests, GITT galvanostatic titration, and dynamic EV profiles. Click a row to expand its specific energy balance (Wh/kg).",
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
            ? "Le chronogramme V(t) & I(t) valide la réponse dynamique, le plateau V(Q) met en évidence la transition biphasique, et la dérivée dQ/dV révèle le pic redox à 3.42V."
            : "V(t) & I(t) telemetry validates dynamic response, V(Q) highlights the two-phase plateau, and differential capacity dQ/dV reveals the redox phase transition at 3.42V.",
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
            ? "Configurez le régime C de charge rapide, la température d'entrée du fluide caloporteur (Eau-Glycol 50/50), le débit (LPM) et la capacité nominale."
            : "Configure fast-charge C-rate, cold-plate coolant inlet temperature (50/50 Water-Glycol), flow rate (LPM), and nominal cell capacity.",
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
            ? "Surveille le gradient transitoire cœur-surface (ΔT < 3.0°C) et la température maximale de contact (T_surf < 45.0°C) pour prévenir tout risque d'emballement thermique."
            : "Monitors transient core-to-surface gradient (ΔT < 3.0°C) and peak surface temperature (T_surf < 45.0°C) to safeguard against thermal runaway.",
          skipBeacon: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-table"]',
          placement: "top",
          title: isFr ? "Tableau des États Transitoires" : "Transient States ODE Table",
          content: isFr
            ? "Inspectez la trajectoire temporelle (s), l'état de charge SOC, l'évolution thermique (T_cœur, T_surface, ΔT) et les flux thermiques instantanés (Pertes Joule + Flux entropique)."
            : "Inspects physical time progression (s), state of charge (SOC), thermal profile (T_core, T_surface, ΔT), and instantaneous heat generation (Joule losses + entropic flux).",
          skipBeacon: true,
        },
        {
          page: "btms",
          target: '[data-tour="btms-charts"]',
          placement: "top",
          title: isFr ? "Dynamique Thermique & Bilan de Flux" : "Thermal Dynamics & Heat Flux Balance",
          content: isFr
            ? "Visualisez la divergence de température cœur/surface face au refroidissement convectif (Dittus-Boelter), ainsi que la décomposition du flux de chaleur selon l'équation de Bernardi."
            : "Visualize core and surface temperature divergence against convective cold-plate cooling (Dittus-Boelter), alongside Bernardi heat generation breakdown.",
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
            ? "Impose un indice de capabilité procédé Cpk > 1.33, un taux d'auto-décharge K-value < 2.0 mV/jour après 14 jours de vieillissement à 25°C, et une résistance DCIR < 35.0 mΩ sous impulsion 10s."
            : "Enforces process capability Cpk > 1.33, self-discharge K-value < 2.0 mV/day after 14-day aging at 25°C, and 10s pulse DCIR < 35.0 mΩ.",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="standards-iec"]',
          placement: "bottom",
          title: isFr ? "Norme IEC 62660-1 (Cellules Li-ion VE)" : "IEC 62660-1 Standard (EV Li-ion Cells)",
          content: isFr
            ? "Encadre les protocoles d'essais de référence (C/12, C/6) pour véhicules électriques routiers et fixe le seuil de fin de vie batterie EOL à 80% de rétention de capacité (40.0 Ah)."
            : "Defines reference test regimes (C/12, C/6) for electric road vehicles and sets the End-Of-Life (EOL) boundary at 80% capacity retention (40.0 Ah).",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="standards-sae"]',
          placement: "bottom",
          title: isFr ? "Norme SAE J2464 (Sécurité & Abus Thermique)" : "SAE J2464 Standard (Thermal Safety & Abuse)",
          content: isFr
            ? "Impose des limites strictes sur le gradient thermique transitoire (ΔT < 3.0°C) pour garantir l'uniformité thermique du pack sous fortes sollicitations de puissance."
            : "Specifies strict limits on transient thermal gradient (ΔT < 3.0°C) to ensure pack temperature uniformity under heavy fast-charging or peak acceleration.",
          skipBeacon: true,
        },
        {
          page: "standards",
          target: '[data-tour="header-datasets"]',
          placement: "bottom",
          title: isFr ? "Centre d'Exportation & Données" : "Data & Audit Export Center",
          content: isFr
            ? "Accédez à tout moment aux fichiers CSV bruts de cyclage et aux registres de qualification métrologique pour vos rapports d'audit qualité et analyses électrochimiques."
            : "Download raw cycling CSV logs and metrology qualification spreadsheets anytime for quality audits and independent electrochemical analysis.",
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
