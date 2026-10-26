import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { defaultLocale, getPrefix, validatePrefix } from "intlayer";
import { NotFoundComponent } from "@/components/not-found";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params }) => {
    const localeParam = params.locale;

    if (localeParam === "api") {
      throw new Response(
        JSON.stringify({ error: "API route must be handled by backend" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

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
