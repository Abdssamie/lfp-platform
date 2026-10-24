import type { IntlayerConfig } from "intlayer";
import { Locales } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    defaultLocale: Locales.FRENCH,
    locales: [Locales.FRENCH, Locales.ENGLISH],
  },
};

export default config;
