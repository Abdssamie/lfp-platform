"use client";

import * as React from "react";
import {
  Cpu,
  LineChart,
  Flame,
  ShieldCheck,
  BatteryCharging,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LocalizedLink, type To } from "@/components/localized-link";
import { useIntlayer } from "react-intlayer";
import { NavUser } from "@/components/nav-user";
import { useLocation } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const content = useIntlayer("app-sidebar");
  const location = useLocation();
  const strippedPath = getPathWithoutLocale(location.pathname) || "/";

  const formationTitle = String(
    content?.formation?.title?.value ?? content?.formation?.title ?? "Formation Line SPC"
  );
  const cyclersTitle = String(
    content?.cyclers?.title?.value ?? content?.cyclers?.title ?? "Cycler Lab Curves"
  );
  const btmsTitle = String(
    content?.btms?.title?.value ?? content?.btms?.title ?? "BTMS Thermal Simulator"
  );
  const standardsTitle = String(
    content?.standardsTitle?.value ?? content?.standardsTitle ?? "Normes IATF / IEC"
  );
  const workstationsHeader = String(
    content?.workstationsHeader?.value ?? content?.workstationsHeader ?? "Postes de Travail"
  );
  const operationsHeader = String(
    content?.operationsHeader?.value ?? content?.operationsHeader ?? "Normes & Conformité"
  );

  const workstationItems: {
    url: To;
    title: string;
    icon: LucideIcon;
    isActive: boolean;
  }[] = [
    {
      url: "/formation" as To,
      title: formationTitle,
      icon: Cpu,
      isActive:
        strippedPath === "/formation" || strippedPath === "/" || strippedPath === "/dashboard",
    },
    {
      url: "/cyclers" as To,
      title: cyclersTitle,
      icon: LineChart,
      isActive: strippedPath === "/cyclers",
    },
    {
      url: "/btms" as To,
      title: btmsTitle,
      icon: Flame,
      isActive: strippedPath === "/btms",
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BatteryCharging className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">LFP Platform</span>
                <span className="text-muted-foreground truncate text-xs font-mono">
                  Giga Line Analytics
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Dedicated Route Navigation for Workstations */}
        <SidebarGroup>
          <SidebarGroupLabel>{workstationsHeader}</SidebarGroupLabel>
          <SidebarMenu>
            {workstationItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className="cursor-pointer"
                  >
                    <LocalizedLink to={item.url}>
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </LocalizedLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Compliance & Standards */}
        <SidebarGroup>
          <SidebarGroupLabel>{operationsHeader}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={strippedPath === "/standards"}
                tooltip={standardsTitle}
                className="cursor-pointer"
              >
                <LocalizedLink to="/standards">
                  <ShieldCheck className="size-4" />
                  <span>{standardsTitle}</span>
                </LocalizedLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: "Abdessamie El Moubarki",
            email: "Battery Systems & Data Engineer",
            avatar: "/profile.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
