import { t, type Dictionary } from "intlayer";

const appSidebarDictionary = {
  key: "app-sidebar",
  content: {
    workstationsHeader: t({ en: "Industrial Workstations", fr: "Postes de Travail Industriels" }),
    formation: {
      title: t({ en: "Formation Line SPC", fr: "Ligne de Formation SPC" }),
      desc: t({ en: "24-Channel Rack & Quality Limits", fr: "Rack 24 canaux & Limites Qualité" }),
    },
    cyclers: {
      title: t({ en: "Cycler Lab Curves", fr: "Courbes Cyclage Laboratoire" }),
      desc: t({ en: "Novonix, Neware & LFP dQ/dV", fr: "Novonix, Neware & dQ/dV LFP" }),
    },
    btms: {
      title: t({ en: "BTMS Thermal Simulator", fr: "Simulateur Thermique BTMS" }),
      desc: t({ en: "Liquid Cooling & Bernardi ODE", fr: "Refroidissement Liquide & ODE" }),
    },
    operationsHeader: t({ en: "Standards & Compliance", fr: "Normes & Conformité" }),
    iatfTitle: t({ en: "IATF 16949 Screening", fr: "Tri Qualité IATF 16949" }),
    iecTitle: t({ en: "IEC 62660-1 Cyclers", fr: "Cyclage IEC 62660-1" }),
    saeTitle: t({ en: "SAE J2464 BTMS Safety", fr: "Sécurité BTMS SAE J2464" }),
    standardsTitle: t({ en: "IATF / IEC Standards", fr: "Normes IATF / IEC" }),
    computeGateway: t({ en: "Compute Gateway (FastAPI)", fr: "Passerelle Calcul (FastAPI)" }),
    ready: t({ en: "Ready", fr: "Prêt" }),
    groups: [
      {
        label: t({ en: "Dashboards", fr: "Tableaux de bord" }),
        items: [
          { title: t({ en: "Dashboard", fr: "Tableau de bord" }), url: "/dashboard" },
          { title: t({ en: "Home", fr: "Accueil" }), url: "/" },
        ],
      },
      {
        label: t({ en: "Settings", fr: "Paramètres" }),
        items: [
          { title: t({ en: "Account", fr: "Compte" }), url: "/settings/account" },
          { title: t({ en: "Organization", fr: "Organisation" }), url: "/settings/organization" },
          { title: t({ en: "Billing", fr: "Facturation" }), url: "/settings/billing" },
        ],
      },
    ],
    signedIn: t({ en: "Signed in", fr: "Connecté" }),
  },
} satisfies Dictionary;

export default appSidebarDictionary;
