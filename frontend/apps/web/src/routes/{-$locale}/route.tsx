import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { defaultLocale, getPrefix, validatePrefix } from "intlayer";
import { NotFoundComponent } from "@/components/not-found";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params }) => {
    const localeParam = params.locale;

    const { isValid } = validatePrefix(localeParam);

    if (!isValid) {
      const { localePrefix: defaultPrefix } = getPrefix(defaultLocale);
      throw redirect({
        to: "/{-$locale}/404",
        params: { locale: defaultPrefix },
      });
    }
  },
  component: Outlet,
  notFoundComponent: NotFoundComponent,
});
