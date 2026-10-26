import { useLocale } from "react-intlayer";
import { useLocation } from "@tanstack/react-router";

export type Locale = "fr" | "en";

export interface TranslationDict {
  common: {
    guide: string;
    datasets: string;
    searchPlaceholder: string;
    searchMobile: string;
    compliant: string;
    nonCompliant: string;
    gradeA: string;
    gradeB: string;
    scrap: string;
    all: string;
    downloadCsv: string;
    next: string;
    previous: string;
    finish: string;
    close: string;
    overview: string;
    step: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  formation: {
    pageTitle: string;
    pageDesc: string;
    pilotBatch: string;
    pilotBatchValue: string;
    restCondition: string;
    yield: string;
    sixSigmaCompliant: string;
    filterPlaceholder: string;
    channel: string;
    serialId: string;
    capacity: string;
    dcir: string;
    kValue: string;
    iatfSorting: string;
    compliance: string;
    noCellsFound: string;
    batchRetention: string;
    specTarget: string;
    coulombicEfficiency: string;
    formationCycle: string;
    redoxPeak: string;
    lineAssignment: string;
    evPack: string;
    bessGrid: string;
    scrapQuarantine: string;
    rejectionReason: string;
    processQualificationTitle: string;
    processQualificationDesc: string;
    tabScreening: string;
    tabScreeningShort: string;
    tabSpc: string;
    tabSpcShort: string;
    kThresholdLabel: string;
    dcirThresholdLabel: string;
    kAxisLabel: string;
    dcirAxisLabel: string;
    spcCapacityAxisLabel: string;
    spcChannelAxisLabel: string;
    gradeAChartLabel: string;
    gradeBChartLabel: string;
    scrapChartLabel: string;
  };
  cyclers: {
    pageTitle: string;
    pageDesc: string;
    specimenLabel: string;
    specimenValue: string;
    chemistry: string;
    biphasicPlateau: string;
    voltageWindow: string;
    validatedSteps: string;
    chartsCardTitle: string;
    chartsCardDesc: string;
    tabOcv: string;
    tabOcvShort: string;
    tabGitt: string;
    tabGittShort: string;
    tabDrive: string;
    tabDriveShort: string;
    telemetryTitle: string;
    vqPlateauTitle: string;
    dqdvTitle: string;
    gittTitle: string;
    driveTitle: string;
    filterAll: string;
    filterCc: string;
    filterGitt: string;
    filterDrive: string;
    filterPlaceholder: string;
    thStep: string;
    thRegime: string;
    thType: string;
    thDuration: string;
    thCurrent: string;
    thCapacity: string;
    thEnergy: string;
    thVoltageRange: string;
    specificDensity: string;
    cellBasis: string;
    capacityFraction: string;
    basis50Ah: string;
    voltageDelta: string;
    transientDelta: string;
    samplingPoints: string;
    samples: string;
    noStepsFound: string;
  };
  btms: {
    pageTitle: string;
    pageDesc: string;
    controlsTitle: string;
    controlsDesc: string;
    runSimulation: string;
    solvingODE: string;
    cRateLabel: string;
    cRateRange: string;
    coolantTempLabel: string;
    coldPlateInlet: string;
    flowRateLabel: string;
    coolantFluid: string;
    nominalCapacityLabel: string;
    prismaticCell: string;
    saeStatus: string;
    saeRule: string;
    maxThermalGradient: string;
    gradientFormula: string;
    peakCoreTemp: string;
    hotspotCenter: string;
    surfacePlateTemp: string;
    heatExchangeInterface: string;
    tableTitle: string;
    tableDesc: string;
    sampledPoints: string;
    thTime: string;
    thSoc: string;
    thTCore: string;
    thTSurf: string;
    thDeltaT: string;
    thJouleLosses: string;
    thEntropicFlux: string;
    thTotalFlux: string;
    thCompliance: string;
    saeCompliant: string;
    chartSectionTitle: string;
    chartSectionDesc: string;
    tempChartTitle: string;
    tempChartDesc: string;
    fluxChartTitle: string;
    fluxChartDesc: string;
  };
  standards: {
    pageTitle: string;
    pageDesc: string;
    iatfCardTitle: string;
    iatfBadge: string;
    iatfDesc: string;
    cpkCardTitle: string;
    cpkCardDesc: string;
    kValueCardTitle: string;
    kValueCardDesc: string;
    dcirCardTitle: string;
    dcirCardDesc: string;
    iecCardTitle: string;
    iecBadge: string;
    iecDesc: string;
    iecRegimesTitle: string;
    iecRegimesDesc: string;
    iecEolTitle: string;
    iecEolDesc: string;
    iecDqdvTitle: string;
    iecDqdvDesc: string;
    saeCardTitle: string;
    saeBadge: string;
    saeDesc: string;
    saeGradientTitle: string;
    saeGradientDesc: string;
    saePeakTitle: string;
    saePeakDesc: string;
    saeFluidTitle: string;
    saeFluidDesc: string;
  };
  search: {
    placeholder: string;
    emptyText: string;
    workstationsHeading: string;
    cyclerDatasetsHeading: string;
    channelInspectionHeading: string;
    iatfStandardsHeading: string;
    inspectChannel: string;
    quarantinedScrap: string;
    tested: string;
  };
  datasetsModal: {
    title: string;
    desc: string;
    tabProcessed: string;
    tabRaw: string;
    rawNotice: string;
    stepsTitle: string;
    stepsBadge: string;
    stepsDesc: string;
    vqTitle: string;
    vqBadge: string;
    vqDesc: string;
    gittTitle: string;
    gittBadge: string;
    gittDesc: string;
    driveTitle: string;
    driveBadge: string;
    driveDesc: string;
    spcTitle: string;
    spcBadge: string;
    spcDesc: string;
    rawCcC12Title: string;
    rawCcC12Desc: string;
    rawCcC6Title: string;
    rawCcC6Desc: string;
    rawGittTitle: string;
    rawGittDesc: string;
    rawDriveTitle: string;
    rawDriveDesc: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  fr: {
    common: {
      guide: "Guide",
      datasets: "Données",
      searchPlaceholder: "Rechercher poste, canal...",
      searchMobile: "Rechercher...",
      compliant: "Conforme",
      nonCompliant: "Non-conforme",
      gradeA: "Grade A",
      gradeB: "Grade B",
      scrap: "Rebut",
      all: "Tous",
      downloadCsv: "CSV",
      next: "Suivant",
      previous: "Précédent",
      finish: "Terminer",
      close: "Fermer",
      overview: "Aperçu",
      step: "Étape",
      hours: "h",
      minutes: "min",
      seconds: "s",
    },
    formation: {
      pageTitle: "Ligne de Formation LFP — Contrôle Qualité & SPC",
      pageDesc: "Qualification Métrologique (24 Canaux) · Tri Automatisé IATF 16949 · Capabilité Six-Sigma (Cpk = 1.42)",
      pilotBatch: "Lot Pilote :",
      pilotBatchValue: "24 Cellules LFP 50Ah",
      restCondition: "Repos 14j @ 25°C",
      yield: "Rend. :",
      sixSigmaCompliant: "Six-Sigma Conforme",
      filterPlaceholder: "Filtrer cellule ou canal...",
      channel: "Canal",
      serialId: "Identifiant Série",
      capacity: "Capacité",
      dcir: "DCIR (10s)",
      kValue: "K-Value",
      iatfSorting: "Tri IATF",
      compliance: "Conformité",
      noCellsFound: "Aucune cellule ne correspond aux critères.",
      batchRetention: "Rétention Lot",
      specTarget: "(> 98.0% spéc)",
      coulombicEfficiency: "Rendement Coulombien",
      formationCycle: "(cycle formation)",
      redoxPeak: "Pic Redox dQ/dV",
      lineAssignment: "Affectation Ligne",
      evPack: "Pack Véhicule Électrique (EV)",
      bessGrid: "Stockage Réseau (BESS)",
      scrapQuarantine: "Rebut / Isolation Sécurité",
      rejectionReason: "Motif de rejet :",
      processQualificationTitle: "Qualification Statistique du Procédé",
      processQualificationDesc: "Matrice de tri par quadrants IATF 16949 et carte de contrôle SPC Shewhart.",
      tabScreening: "Quadrants de Tri (K-Value vs DCIR)",
      tabScreeningShort: "Quadrants K/DCIR",
      tabSpc: "Carte de Contrôle SPC Shewhart (Capacité Ah)",
      tabSpcShort: "SPC Shewhart",
      kThresholdLabel: "Seuil K = 0.15 mV/j",
      dcirThresholdLabel: "Seuil DCIR = 1.8 mΩ",
      kAxisLabel: "Taux d'auto-décharge — K = dV/dt (mV/jour)",
      dcirAxisLabel: "Résistance DCIR (mΩ)",
      spcCapacityAxisLabel: "Capacité Réelle (Ah)",
      spcChannelAxisLabel: "Canal de Formation",
      gradeAChartLabel: "Grade A — Pack Véhicule Électrique (EV)",
      gradeBChartLabel: "Grade B — Stockage Réseau (BESS)",
      scrapChartLabel: "Quarantaine / Rebut (Micro-court-circuit)",
    },
    cyclers: {
      pageTitle: "Laboratoire de Cyclage — Caractérisation LFP 50Ah",
      pageDesc: "Protocoles Haute Précision : Pseudo-OCV (C/12 & C/6) · Cinétique GITT (118.4h) · Cycles Dynamiques VE · LG Chem Prismatic LiFePO₄ / Graphite",
      specimenLabel: "Spécimen d'Essai :",
      specimenValue: "LG Chem 50Ah (Prismatique)",
      chemistry: "LiFePO₄ / Graphite",
      biphasicPlateau: "Plateau :",
      voltageWindow: "Fenêtre :",
      validatedSteps: "12 Étapes Validées (148.1h)",
      chartsCardTitle: "Analyses Graphiques & Validation Électrochimique",
      chartsCardDesc: "Examinez les courbes caractéristiques selon le mode d'essai sélectionné.",
      tabOcv: "Pseudo-OCV & dQ/dV",
      tabOcvShort: "OCV",
      tabGitt: "Titration GITT 0.33C",
      tabGittShort: "GITT",
      tabDrive: "Profil VE Dynamique",
      tabDriveShort: "VE",
      telemetryTitle: "Chronogramme V(t) & I(t) — Cycle C/12 (24.5h)",
      vqPlateauTitle: "Plateau de Tension Biphasique V(Q)",
      dqdvTitle: "Dérivée Capacitive dQ/dV — Transition de Phase Redox à 3.42V",
      gittTitle: "Cinétique GITT (58 Impulsions sur 118.4 Heures & Diffusion Li⁺)",
      driveTitle: "Cycle Routier Dynamique VE (Profil 1 — 5.22h)",
      filterAll: "Tous les Essais",
      filterCc: "Courant Constant",
      filterGitt: "GITT 0.33C",
      filterDrive: "Profil VE",
      filterPlaceholder: "Filtrer étape ou régime...",
      thStep: "Étape",
      thRegime: "Régime & Protocole",
      thType: "Type",
      thDuration: "Durée",
      thCurrent: "Courant",
      thCapacity: "Capacité",
      thEnergy: "Énergie",
      thVoltageRange: "Plage V",
      specificDensity: "Densité Spécifique",
      cellBasis: "(cellule 850g)",
      capacityFraction: "Fraction Capacité",
      basis50Ah: "(base 50Ah)",
      voltageDelta: "Amplitude Tension",
      transientDelta: "(ΔV transitoire)",
      samplingPoints: "Points de Mesure",
      samples: "(échantillons)",
      noStepsFound: "Aucune étape ne correspond aux critères.",
    },
    btms: {
      pageTitle: "Gestion Thermique BTMS — Simulation Plaque Froide & Équilibre de Bernardi",
      pageDesc: "Tableau des États Transitoires · Modèle d'Échauffement 1D Couplé (SciPy RK45) · Convection Dittus-Boelter (Eau-Glycol 50/50)",
      controlsTitle: "Paramètres de Simulation Thermique BTMS & Bilan de Bernardi",
      controlsDesc: "Solveur ODE couplé à deux états 1D (SciPy RK45) avec corrélation convective de Dittus-Boelter (Mélange Eau-Glycol 50/50).",
      runSimulation: "Lancer la Simulation",
      solvingODE: "Résolution ODE RK45...",
      cRateLabel: "Régime de Charge",
      cRateRange: "Plage: 0.5C à 5.0C (charge rapide)",
      coolantTempLabel: "Temp. Fluide Caloporteur",
      coldPlateInlet: "Entrée de plaque froide",
      flowRateLabel: "Débit Caloporteur",
      coolantFluid: "Mélange Eau-Éthylène Glycol 50/50",
      nominalCapacityLabel: "Capacité Nominale Cellule",
      prismaticCell: "Cellule prismatique LFP",
      saeStatus: "Statut Norme SAE J2464",
      saeRule: "Max ΔT < 3.0°C & T_surf < 45°C",
      maxThermalGradient: "Gradient Thermique Max",
      gradientFormula: "Delta cœur-surface (ΔT = T_coeur - T_surf)",
      peakCoreTemp: "Température Crête Cœur",
      hotspotCenter: "Point chaud calculé au centre du jelly roll",
      surfacePlateTemp: "Température Surface Plaque",
      heatExchangeInterface: "Interface thermique d'échange caloporteur",
      tableTitle: "Tableau des États Transitoires (SciPy RK45)",
      tableDesc: "Valeurs physiques résolues pas à pas: temps (s), SOC, températures (°C), gradient thermique et flux de chaleur (W).",
      sampledPoints: "Points Échantillonnés",
      thTime: "Temps (s)",
      thSoc: "SOC (%)",
      thTCore: "T_cœur (°C)",
      thTSurf: "T_surface (°C)",
      thDeltaT: "Gradient ΔT (°C)",
      thJouleLosses: "Pertes Joule (W)",
      thEntropicFlux: "Flux Entropique (W)",
      thTotalFlux: "Flux Total (W)",
      thCompliance: "Conformité",
      saeCompliant: "SAE Conforme",
      chartSectionTitle: "Analyses Graphiques & Réponses Thermodynamiques",
      chartSectionDesc: "Résolution mathématique du couplage conduction interne / convection plaque froide.",
      tempChartTitle: "Évolution Temporelle des Températures T(t)",
      tempChartDesc: "Cœur de cellule (T_core) vs Surface de contact plaque froide (T_surf)",
      fluxChartTitle: "Bilan des Flux Thermiques de Bernardi Q(t)",
      fluxChartDesc: "Décomposition des flux: Pertes Joule irréversibles vs Flux entropique réversible",
    },
    standards: {
      pageTitle: "Normes de Fabrication & Conformité Qualité",
      pageDesc: "Spécifications IATF 16949, Méthodologies de Cyclage IEC 62660-1 et Critères Thermiques SAE J2464",
      iatfCardTitle: "IATF 16949 — Contrôle Qualité & Capabilité Procédé",
      iatfBadge: "Conforme Automotive",
      iatfDesc: "Exigences pour la qualification des cellules prismatiques LFP en ligne de gigafactory.",
      cpkCardTitle: "Indice de Capabilité Cpk",
      cpkCardDesc: "Cible minimale: > 1.33 (Statut actuel: 1.42). Tolérance 6-Sigma validée.",
      kValueCardTitle: "Seuil K-Value (Auto-décharge)",
      kValueCardDesc: "K < 2.0 mV/jour après 14 jours de vieillissement thermique à 25°C.",
      dcirCardTitle: "Seuil DCIR (Résistance Interne)",
      dcirCardDesc: "DCIR < 35.0 mΩ sous impulsion 10s à 50% SOC (1C / 25°C).",
      iecCardTitle: "IEC 62660-1 — Éléments Li-ion pour Véhicules Électriques",
      iecBadge: "Protocole Actif",
      iecDesc: "Régimes de vieillissement accéléré, dQ/dV et dégradation de capacité sous cyclage sévère.",
      iecRegimesTitle: "Régimes de Charge / Décharge",
      iecRegimesDesc: "Tests de 0.5C à 3.0C avec coupure standard 2.0V – 3.65V (Chimie LFP).",
      iecEolTitle: "Rétention de Capacité EOL",
      iecEolDesc: "Critère de fin de vie: 80% de la capacité nominale initiale (50.0 Ah → 40.0 Ah).",
      iecDqdvTitle: "Analyse Différentielle dQ/dV",
      iecDqdvDesc: "Suivi des pics de transition de phase biphasique LiFePO₄ ↔ FePO₄.",
      saeCardTitle: "SAE J2464 — Sécurité & Gestion Thermique BTMS",
      saeBadge: "Contrôle Thermique",
      saeDesc: "Limites de gradient thermique et température crête pour prévenir tout risque d'emballement.",
      saeGradientTitle: "Gradient Inter-cellulaire Max",
      saeGradientDesc: "ΔT < 3.0°C entre cellules du module sous charge rapide 2C.",
      saePeakTitle: "Température Crête Admissible",
      saePeakDesc: "T_max < 45.0°C au cœur de cellule (solveur RK45 couplé avec Bernardi).",
      saeFluidTitle: "Fluide Caloporteur",
      saeFluidDesc: "Mélange Eau-Éthylène Glycol 50/50 avec débit régulé de 2 à 10 LPM.",
    },
    search: {
      placeholder: "Rechercher poste, canal, ou métrique...",
      emptyText: "Aucune télémétrie de batterie correspondante.",
      workstationsHeading: "Postes de Travail",
      cyclerDatasetsHeading: "Jeux de Données Cyclage",
      channelInspectionHeading: "Inspection de Canal",
      iatfStandardsHeading: "Normes IATF 16949",
      inspectChannel: "Inspecter Canal",
      quarantinedScrap: "(Rebut Quarantaine)",
      tested: "(Testé)",
    },
    datasetsModal: {
      title: "Export des Données Électrochimiques",
      desc: "Spécimen : Cellule prismatique LG Chem 50Ah LiFePO₄ · Lot formation 24 canaux",
      tabProcessed: "Séries Traitées",
      tabRaw: "Banc Brut (CSV)",
      rawNotice: "Séries temporelles complètes acquises directement sur les bancs de cyclage industriels (points bruts V, I, T, temps).",
      stepsTitle: "Protocole d'Essais (12 Étapes)",
      stepsBadge: "148.1h · 12 Étapes",
      stepsDesc: "Quasi-statiques C/12, benchmarks C/6, titration GITT et profils VE.",
      vqTitle: "Courbes V(Q) & Dérivée dQ/dV",
      vqBadge: "Pic Redox 3.42V",
      vqDesc: "Plateau de tension diphasique LiFePO₄ et transition de phase.",
      gittTitle: "Cinétique GITT 0.33C & Diffusion Li⁺",
      gittBadge: "58 Pulses (118.4h)",
      gittDesc: "Titration galvanostatique, relaxation OCV et impulsion Ri.",
      driveTitle: "Cycle Routier Dynamique VE",
      driveBadge: "WLTP / US06",
      driveDesc: "Profil 5.2h : accélérations +47A et freinages régénératifs -25A.",
      spcTitle: "Registre Qualité Lot SPC (24 Canaux)",
      spcBadge: "IATF 16949 · Cpk 1.42",
      spcDesc: "Capacité Ah, chute K-Value (mV/j), DCIR 10s et affectation des grades.",
      rawCcC12Title: "cc_0_08.csv — Cyclage C/12 Quasi-Équilibre",
      rawCcC12Desc: "Charge & décharge continues à 0.08C (4.08A) sur 24.5h (88k points).",
      rawCcC6Title: "cc_0_17.csv — Benchmarks C/6 Fast Reference",
      rawCcC6Desc: "Cycles de référence à régime double C/6 (8.17A) pour surtension.",
      rawGittTitle: "gitt_0_33C.csv — Titration Multi-Impulsions GITT",
      rawGittDesc: "Titration galvanostatique à 0.33C (16.33A) avec relaxations complètes.",
      rawDriveTitle: "profile_1.csv — Profil Roulage VE Haute Dynamique",
      rawDriveDesc: "Sollicitations routières : pointes d'accélération +47A et freinages -25A.",
    },
  },
  en: {
    common: {
      guide: "Guide",
      datasets: "Datasets",
      searchPlaceholder: "Search workstation, channel...",
      searchMobile: "Search...",
      compliant: "Compliant",
      nonCompliant: "Non-Compliant",
      gradeA: "Grade A",
      gradeB: "Grade B",
      scrap: "Scrap",
      all: "All",
      downloadCsv: "CSV",
      next: "Next",
      previous: "Previous",
      finish: "Finish",
      close: "Close",
      overview: "Overview",
      step: "Step",
      hours: "h",
      minutes: "min",
      seconds: "s",
    },
    formation: {
      pageTitle: "LFP Formation Line — Quality Control & SPC",
      pageDesc: "Metrological Qualification (24 Channels) · Automated IATF 16949 Sorting · Six-Sigma Capability (Cpk = 1.42)",
      pilotBatch: "Pilot Batch:",
      pilotBatchValue: "24 LFP 50Ah Cells",
      restCondition: "14d Rest @ 25°C",
      yield: "Yield:",
      sixSigmaCompliant: "Six-Sigma Compliant",
      filterPlaceholder: "Filter cell or channel...",
      channel: "Channel",
      serialId: "Serial ID",
      capacity: "Capacity",
      dcir: "DCIR (10s)",
      kValue: "K-Value",
      iatfSorting: "IATF Sorting",
      compliance: "Compliance",
      noCellsFound: "No cells match the criteria.",
      batchRetention: "Batch Retention",
      specTarget: "(> 98.0% spec)",
      coulombicEfficiency: "Coulombic Efficiency",
      formationCycle: "(formation cycle)",
      redoxPeak: "Redox Peak dQ/dV",
      lineAssignment: "Line Assignment",
      evPack: "EV Battery Pack",
      bessGrid: "Grid Storage (BESS)",
      scrapQuarantine: "Scrap / Safety Quarantine",
      rejectionReason: "Rejection reason:",
      processQualificationTitle: "Statistical Process Qualification",
      processQualificationDesc: "IATF 16949 quadrant screening matrix and Shewhart SPC run chart.",
      tabScreening: "Screening Quadrants (K-Value vs DCIR)",
      tabScreeningShort: "Quadrants K/DCIR",
      tabSpc: "SPC Shewhart Control Chart (Capacity Ah)",
      tabSpcShort: "SPC Shewhart",
      kThresholdLabel: "K Limit = 0.15 mV/d",
      dcirThresholdLabel: "DCIR Limit = 1.8 mΩ",
      kAxisLabel: "Self-discharge rate — K = dV/dt (mV/day)",
      dcirAxisLabel: "DCIR Resistance (mΩ)",
      spcCapacityAxisLabel: "Actual Capacity (Ah)",
      spcChannelAxisLabel: "Formation Channel",
      gradeAChartLabel: "Grade A — EV Battery Pack",
      gradeBChartLabel: "Grade B — Grid Storage (BESS)",
      scrapChartLabel: "Quarantine / Scrap (Micro-short risk)",
    },
    cyclers: {
      pageTitle: "Cycler Laboratory — LFP 50Ah Characterization",
      pageDesc: "High-Precision Protocols: Pseudo-OCV (C/12 & C/6) · GITT Kinetics (118.4h) · Dynamic EV Cycles · LG Chem Prismatic LiFePO₄ / Graphite",
      specimenLabel: "Test Specimen:",
      specimenValue: "LG Chem 50Ah (Prismatic)",
      chemistry: "LiFePO₄ / Graphite",
      biphasicPlateau: "Plateau:",
      voltageWindow: "Window:",
      validatedSteps: "12 Validated Steps (148.1h)",
      chartsCardTitle: "Graphical Analytics & Electrochemical Validation",
      chartsCardDesc: "Examine characteristic curves according to the selected test mode.",
      tabOcv: "Pseudo-OCV & dQ/dV",
      tabOcvShort: "OCV",
      tabGitt: "GITT 0.33C Titration",
      tabGittShort: "GITT",
      tabDrive: "Dynamic EV Profile",
      tabDriveShort: "EV",
      telemetryTitle: "V(t) & I(t) Chronogram — C/12 Cycle (24.5h)",
      vqPlateauTitle: "Two-Phase Voltage Plateau V(Q)",
      dqdvTitle: "Capacitive Derivative dQ/dV — Redox Phase Transition at 3.42V",
      gittTitle: "GITT Kinetics (58 Pulses over 118.4 Hours & Li⁺ Diffusion)",
      driveTitle: "Dynamic EV Drive Cycle (Profile 1 — 5.22h)",
      filterAll: "All Tests",
      filterCc: "Constant Current",
      filterGitt: "GITT 0.33C",
      filterDrive: "EV Profile",
      filterPlaceholder: "Filter step or regime...",
      thStep: "Step",
      thRegime: "Regime & Protocol",
      thType: "Type",
      thDuration: "Duration",
      thCurrent: "Current",
      thCapacity: "Capacity",
      thEnergy: "Energy",
      thVoltageRange: "V Range",
      specificDensity: "Specific Density",
      cellBasis: "(850g cell)",
      capacityFraction: "Capacity Fraction",
      basis50Ah: "(50Ah base)",
      voltageDelta: "Voltage Amplitude",
      transientDelta: "(Transient ΔV)",
      samplingPoints: "Sampling Points",
      samples: "(samples)",
      noStepsFound: "No steps match the criteria.",
    },
    btms: {
      pageTitle: "BTMS Thermal Management — Cold Plate Simulation & Bernardi Balance",
      pageDesc: "Transient State Ledger · 1D Coupled Thermal Model (SciPy RK45) · Dittus-Boelter Convection (Water-Glycol 50/50)",
      controlsTitle: "BTMS Thermal Simulation Parameters & Bernardi Balance",
      controlsDesc: "1D two-state coupled ODE solver (SciPy RK45) with Dittus-Boelter convective correlation (Water-Glycol 50/50 mix).",
      runSimulation: "Run Simulation",
      solvingODE: "Solving ODE RK45...",
      cRateLabel: "Charge C-Rate",
      cRateRange: "Range: 0.5C to 5.0C (fast charge)",
      coolantTempLabel: "Coolant Fluid Temp",
      coldPlateInlet: "Cold plate inlet",
      flowRateLabel: "Coolant Flow Rate",
      coolantFluid: "Water-Ethylene Glycol 50/50 Mix",
      nominalCapacityLabel: "Nominal Cell Capacity",
      prismaticCell: "Prismatic LFP Cell",
      saeStatus: "SAE J2464 Standard Status",
      saeRule: "Max ΔT < 3.0°C & T_surf < 45°C",
      maxThermalGradient: "Max Thermal Gradient",
      gradientFormula: "Core-to-surface delta (ΔT = T_core - T_surf)",
      peakCoreTemp: "Peak Core Temperature",
      hotspotCenter: "Hot spot calculated at jelly roll center",
      surfacePlateTemp: "Cold Plate Surface Temp",
      heatExchangeInterface: "Coolant thermal exchange interface",
      tableTitle: "Transient States Ledger (SciPy RK45)",
      tableDesc: "Step-by-step resolved physics: time (s), SOC, temperatures (°C), thermal gradient, and heat flux (W).",
      sampledPoints: "Sampled Points",
      thTime: "Time (s)",
      thSoc: "SOC (%)",
      thTCore: "T_core (°C)",
      thTSurf: "T_surface (°C)",
      thDeltaT: "Gradient ΔT (°C)",
      thJouleLosses: "Joule Losses (W)",
      thEntropicFlux: "Entropic Flux (W)",
      thTotalFlux: "Total Flux (W)",
      thCompliance: "Compliance",
      saeCompliant: "SAE Compliant",
      chartSectionTitle: "Graphical Analytics & Thermodynamic Responses",
      chartSectionDesc: "Mathematical resolution of internal conduction coupled with cold plate convection.",
      tempChartTitle: "Temperature Time Evolution T(t)",
      tempChartDesc: "Cell core (T_core) vs Cold plate contact surface (T_surf)",
      fluxChartTitle: "Bernardi Thermal Heat Flux Balance Q(t)",
      fluxChartDesc: "Flux breakdown: Irreversible Joule losses vs Reversible entropic flux",
    },
    standards: {
      pageTitle: "Manufacturing Standards & Quality Compliance",
      pageDesc: "IATF 16949 Specifications, IEC 62660-1 Cycling Methodologies, and SAE J2464 Thermal Criteria",
      iatfCardTitle: "IATF 16949 — Quality Control & Process Capability",
      iatfBadge: "Automotive Compliant",
      iatfDesc: "Requirements for prismatic LFP cell qualification on gigafactory production lines.",
      cpkCardTitle: "Process Capability Index Cpk",
      cpkCardDesc: "Minimum target: > 1.33 (Current status: 1.42). Six-Sigma tolerance verified.",
      kValueCardTitle: "K-Value Limit (Self-discharge)",
      kValueCardDesc: "K < 2.0 mV/day after 14 days thermal aging at 25°C.",
      dcirCardTitle: "DCIR Limit (Internal Resistance)",
      dcirCardDesc: "DCIR < 35.0 mΩ under 10s pulse at 50% SOC (1C / 25°C).",
      iecCardTitle: "IEC 62660-1 — Li-ion Cells for Electric Vehicles",
      iecBadge: "Active Protocol",
      iecDesc: "Accelerated aging regimes, dQ/dV, and capacity degradation under severe cycling.",
      iecRegimesTitle: "Charge / Discharge Regimes",
      iecRegimesDesc: "Testing from 0.5C to 3.0C with standard 2.0V – 3.65V cut-off (LFP chemistry).",
      iecEolTitle: "EOL Capacity Retention",
      iecEolDesc: "End of life criterion: 80% of initial nominal capacity (50.0 Ah → 40.0 Ah).",
      iecDqdvTitle: "Differential dQ/dV Analysis",
      iecDqdvDesc: "Tracking two-phase redox transition peaks LiFePO₄ ↔ FePO₄.",
      saeCardTitle: "SAE J2464 — Safety & BTMS Thermal Management",
      saeBadge: "Thermal Control",
      saeDesc: "Thermal gradient and peak temperature limits to prevent any thermal runaway hazard.",
      saeGradientTitle: "Max Inter-Cell Gradient",
      saeGradientDesc: "ΔT < 3.0°C between module cells under 2C fast charge.",
      saePeakTitle: "Allowable Peak Temperature",
      saePeakDesc: "T_max < 45.0°C at cell core (RK45 solver coupled with Bernardi balance).",
      saeFluidTitle: "Coolant Fluid",
      saeFluidDesc: "Water-Ethylene Glycol 50/50 mixture with regulated flow from 2 to 10 LPM.",
    },
    search: {
      placeholder: "Search workstation, channel, or metric...",
      emptyText: "No matching battery telemetry found.",
      workstationsHeading: "Workstations",
      cyclerDatasetsHeading: "Cycler Datasets",
      channelInspectionHeading: "Channel Inspection",
      iatfStandardsHeading: "IATF 16949 Standards",
      inspectChannel: "Inspect Channel",
      quarantinedScrap: "(Quarantined Scrap)",
      tested: "(Tested)",
    },
    datasetsModal: {
      title: "Electrochemical Dataset Export",
      desc: "Specimen: LG Chem 50Ah LiFePO₄ Prismatic Cell · 24-Channel Formation Batch",
      tabProcessed: "Processed Series",
      tabRaw: "Raw Bench (CSV)",
      rawNotice: "Full time series acquired directly from industrial cycler test benches (raw V, I, T, time).",
      stepsTitle: "Test Protocol (12 Steps)",
      stepsBadge: "148.1h · 12 Steps",
      stepsDesc: "Quasi-static C/12, C/6 benchmarks, GITT titration, and EV profiles.",
      vqTitle: "V(Q) Curves & dQ/dV Derivative",
      vqBadge: "Redox Peak 3.42V",
      vqDesc: "LiFePO₄ two-phase voltage plateau and phase transition.",
      gittTitle: "GITT 0.33C Kinetics & Li⁺ Diffusion",
      gittBadge: "58 Pulses (118.4h)",
      gittDesc: "Galvanostatic titration, OCV relaxation, and Ri pulse resistance.",
      driveTitle: "Dynamic EV Drive Cycle",
      driveBadge: "WLTP / US06",
      driveDesc: "5.2h profile: +47A accelerations and -25A regenerative braking.",
      spcTitle: "SPC Batch Quality Ledger (24 Channels)",
      spcBadge: "IATF 16949 · Cpk 1.42",
      spcDesc: "Ah capacity, K-Value drop (mV/day), 10s DCIR, and grade assignments.",
      rawCcC12Title: "cc_0_08.csv — C/12 Quasi-Equilibrium Cycling",
      rawCcC12Desc: "Continuous charge & discharge at 0.08C (4.08A) over 24.5h (88k points).",
      rawCcC6Title: "cc_0_17.csv — C/6 Fast Reference Benchmarks",
      rawCcC6Desc: "Double-rate C/6 (8.17A) reference cycles for overpotential inspection.",
      rawGittTitle: "gitt_0_33C.csv — GITT Multi-Pulse Titration",
      rawGittDesc: "Galvanostatic titration at 0.33C (16.33A) with complete relaxations.",
      rawDriveTitle: "profile_1.csv — High-Dynamics EV Drive Profile",
      rawDriveDesc: "Road stress profiles: +47A acceleration peaks and -25A braking swings.",
    },
  },
};

/**
 * Hook to retrieve the current translation dictionary
 */
export function usePlatformTranslation(): {
  locale: Locale;
  isFr: boolean;
  t: TranslationDict;
} {
  const { locale: intlayerLocale } = useLocale();
  const { pathname } = useLocation();

  const pathSegments = pathname.split("/").filter(Boolean);
  const pathLocale =
    pathSegments[0] === "en" || pathSegments[0] === "fr"
      ? (pathSegments[0] as Locale)
      : undefined;

  const currentLocale: Locale = pathLocale ?? (intlayerLocale === "en" ? "en" : "fr");

  return {
    locale: currentLocale,
    isFr: currentLocale === "fr",
    t: translations[currentLocale],
  };
}

/**
 * Localize failure reasons coming from backend or mock dataset
 */
export function localizeFailureReason(reason: string, isFr: boolean): string {
  if (!isFr) return reason;

  if (reason.includes("Excessive voltage relaxation drop") || reason.includes("K-value > 0.20")) {
    return "Chute anormale de relaxation de tension (K-value > 0.20 mV/j : Risque micro-court-circuit)";
  }
  if (reason.includes("Internal resistance exceeds limit") || reason.includes("DCIR > 2.0")) {
    return "Résistance interne hors tolérance (DCIR > 2.0 mΩ)";
  }
  if (reason.includes("Sub-nominal capacity")) {
    return "Capacité sous-nominale (48.75 Ah < seuil 49.00 Ah Grade A)";
  }
  if (reason.includes("Micro-short hazard")) {
    return reason.replace("Micro-short hazard", "Risque de micro-court-circuit").replace("mV/day", "mV/j");
  }
  if (reason.includes("Low capacity")) {
    return reason.replace("Low capacity", "Capacité faible").replace("limit", "limite");
  }
  if (reason.includes("Excessive DCIR")) {
    return reason.replace("Excessive DCIR", "DCIR excessif").replace("limit", "limite");
  }
  if (reason.includes("Marginal capacity: Rerouted to ESS")) {
    return "Capacité limite : Redirigé vers BESS";
  }
  if (reason.includes("Elevated DCIR: Rerouted to ESS")) {
    return "DCIR élevé : Redirigé vers BESS";
  }

  return reason;
}

/**
 * Localize Grade badge string
 */
export function localizeGrade(grade: string, isFr: boolean): string {
  if (grade === "Scrap") {
    return isFr ? "Rebut" : "Scrap";
  }
  return grade;
}
