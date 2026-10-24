"use client";

import * as React from "react";
import { useIntlayer } from "react-intlayer";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandSearch, SearchTrigger } from "@/components/command-search";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle } from "lucide-react";
import { DatasetDownloadModal } from "@/components/modals/dataset-download-modal";
import { useTour } from "@/components/guided-tour/tour-context";

export function SiteHeader() {
  const content = useIntlayer("site-header");
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
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startTour}
              className="h-8 gap-1.5 text-xs font-mono cursor-pointer"
              title="Lancer la visite guidée interactive"
              data-tour="header-tour"
            >
              <HelpCircle className="size-3.5" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDownloadModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-mono cursor-pointer"
              title={content.downloadTooltip.value}
              data-tour="header-datasets"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">{content.downloadDatasets.value}</span>
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
