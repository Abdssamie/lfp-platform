"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandSearch, SearchTrigger } from "@/components/command-search";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle } from "lucide-react";
import { DatasetDownloadModal } from "@/components/modals/dataset-download-modal";
import { useTour } from "@/components/guided-tour/tour-context";
import { usePlatformTranslation } from "@/lib/translations";

export function SiteHeader() {
  const { t, isFr } = usePlatformTranslation();
  const { startTour } = useTour();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-3 py-2 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
          {/* Search bar — hides completely below sm, icon-only button instead */}
          <div className="flex-1 hidden sm:block sm:max-w-xs lg:max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          {/* Icon-only search on mobile */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent transition-colors"
            title={t.common.searchMobile}
            aria-label={t.common.searchMobile}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startTour}
              className="h-8 gap-1.5 text-xs font-mono cursor-pointer px-2 sm:px-3"
              title={isFr ? "Lancer la visite guidée interactive" : "Launch interactive guided tour"}
              data-tour="header-tour"
            >
              <HelpCircle className="size-3.5" />
              <span className="hidden sm:inline">{t.common.guide}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDownloadModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-mono cursor-pointer px-2 sm:px-3"
              title={isFr ? "Télécharger les jeux de données & benchmarks" : "Download datasets & benchmarks"}
              data-tour="header-datasets"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">{t.common.datasets}</span>
            </Button>
            <LocaleSwitcher />
            <ModeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <DatasetDownloadModal open={downloadModalOpen} onOpenChange={setDownloadModalOpen} />
    </>
  );
}
