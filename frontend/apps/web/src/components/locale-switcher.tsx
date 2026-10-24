import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { getPathWithoutLocale, getPrefix } from "intlayer";
import type { FC } from "react";
import { useLocale } from "react-intlayer";
import { LOCALE_ROUTE } from "@/lib/locale-route";
import type { FileRouteTypes } from "@/routeTree.gen";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const localeToFlag: Record<string, string> = {
  en: "🇺🇸",
  fr: "🇫🇷",
  es: "🇪🇸",
  de: "🇩🇪",
  it: "🇮🇹",
  ar: "🇲🇦",
};

const getFlag = (locale: string) => {
  const code = locale.toLowerCase().slice(0, 2);
  return localeToFlag[code] || "🌐";
};

export const LocaleSwitcher: FC = () => {
  const { pathname } = useLocation();
  const { availableLocales, locale, setLocale } = useLocale();
  const navigate = useNavigate({ from: "/{-$locale}" });

  const pathWithoutLocale = getPathWithoutLocale(pathname) || "/";
  const localizedTo = `/${LOCALE_ROUTE}${pathWithoutLocale}` as FileRouteTypes["to"];

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    const { localePrefix } = getPrefix(newLocale);

    setLocale(newLocale);

    void navigate({
      to: localizedTo,
      params: { locale: localePrefix },
    });
  };

  return (
    <div className="relative">
      <nav aria-hidden="true" aria-label="Language versions" className="sr-only">
        {availableLocales.map((localeEl) => (
          <Link
            key={localeEl}
            to={localizedTo}
            params={{ locale: getPrefix(localeEl).localePrefix }}
            tabIndex={-1}
            hrefLang={localeEl}
          >
            {localeEl}
          </Link>
        ))}
      </nav>

      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-fit gap-2 [&>svg]:hidden focus:ring-1">
          <SelectValue>
            <div className="flex items-center gap-2 font-medium">
              <span>{getFlag(locale)}</span>
              <span>{locale.toUpperCase()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {availableLocales.map((localeEl) => (
            <SelectItem key={localeEl} value={localeEl} className="cursor-pointer">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-base">{getFlag(localeEl)}</span>
                <span>{localeEl.toUpperCase()}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
