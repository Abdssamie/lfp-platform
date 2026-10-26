import { t, type Dictionary } from "intlayer";

const siteHeaderDictionary = {
  key: "site-header",
  content: {
    formation: t({ en: "Formation SPC", fr: "Formation SPC" }),
    cyclers: t({ en: "Cycler Lab", fr: "Cyclage Labo" }),
    btms: t({ en: "BTMS Simulator", fr: "Simulateur BTMS" }),
    syncData: t({ en: "Sync Data", fr: "Synchroniser" }),
    searchPrompt: t({ en: "Search workstation, channel...", fr: "Rechercher poste, canal..." }),
    downloadDatasets: t({ en: "Datasets", fr: "Données" }),
    downloadTooltip: t({
      en: "Download datasets & benchmarks",
      fr: "Télécharger les jeux de données & benchmarks",
    }),
  },
} satisfies Dictionary;

export default siteHeaderDictionary;
