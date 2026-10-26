"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TourProvider } from "@/components/guided-tour/tour-context";
import { GuidedTour } from "@/components/guided-tour/guided-tour";

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function BaseLayout({ children, title, description }: BaseLayoutProps) {
  return (
    <TourProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" collapsible="icon" side="left" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {title && (
                  <div className="px-4 lg:px-6">
                    <div className="flex flex-col gap-1.5">
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{title}</h1>
                      {description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <GuidedTour />
    </TourProvider>
  );
}
