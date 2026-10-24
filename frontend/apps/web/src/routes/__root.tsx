import { Toaster } from "@convex-zen/ui/components/sonner";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeProvider } from "@/components/theme-provider";
import { HeadProvider } from "@/lib/head-provider";
import { defaultLocale, getHTMLTextDir } from "intlayer";
import { IntlayerProvider } from "react-intlayer";
import { WorkstationProvider } from "@/contexts/workstation-context";

import appCss from "../index.css?url";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LFP Battery Analytics & Formation Platform",
      },
      {
        property: "og:title",
        content: "LFP Battery Analytics & Formation Platform",
      },
      {
        property: "og:description",
        content: "Industrial Battery Analytics, Formation Line SPC, Cycler Telemetry & BTMS Simulation",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: () => {
    const context = useRouteContext({ from: Route.id });

    return (
      <QueryClientProvider client={context.queryClient}>
        <ThemeProvider>
          <HeadProvider>
            <RootDocument>
              <Outlet />
            </RootDocument>
          </HeadProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const params = useParams({ strict: false });
  const locale = (params as { locale?: string })?.locale ?? defaultLocale;

  return (
    <html dir={getHTMLTextDir(locale)} lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <IntlayerProvider locale={locale}>
          <WorkstationProvider>
            {children}
            <Toaster richColors />
            <TanStackRouterDevtools position="bottom-right" />
            <Scripts />
          </WorkstationProvider>
        </IntlayerProvider>
      </body>
    </html>
  );
}
