import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getPrefix } from "intlayer";
import { useLocale } from "react-intlayer";
import type { StripLocalePrefix } from "@/components/localized-link";
import type { FileRouteTypes } from "@/routeTree.gen";
import { LOCALE_ROUTE } from "@/lib/locale-route";

type NavigateFn = ReturnType<typeof useNavigate>;
type BaseNavigateOptions = Parameters<NavigateFn>[0];

export type LocalizedTo = StripLocalePrefix<FileRouteTypes["to"]>;

export type LocalizedNavigateOptions = Omit<BaseNavigateOptions, "to" | "params" | "search"> & {
  to: LocalizedTo | string;
  params?: Omit<NonNullable<BaseNavigateOptions["params"]>, "locale">;
  search?: Record<string, unknown>;
};

export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();

  return useCallback(
    ({ to, params, search, ...rest }: LocalizedNavigateOptions) => {
      const { localePrefix } = getPrefix(locale);
      const localizedTo = `/${LOCALE_ROUTE}${to}` as FileRouteTypes["to"];

      return (navigate as (opts: unknown) => ReturnType<NavigateFn>)({
        ...rest,
        to: localizedTo,
        params: { locale: localePrefix, ...params },
        ...(search !== undefined && { search }),
      });
    },
    [navigate, locale],
  );
};
