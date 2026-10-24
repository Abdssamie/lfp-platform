"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Cpu, Flame, LineChart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useWorkstation, type WorkspaceMode } from "@/contexts/workstation-context";
import { useLocale } from "react-intlayer";

interface FacilityOption {
  id: WorkspaceMode;
  nameEn: string;
  nameFr: string;
  lineEn: string;
  lineFr: string;
  icon: React.ComponentType<{ className?: string }>;
}

const facilities: FacilityOption[] = [
  {
    id: "formation",
    nameEn: "Giga 1 · Cell Formation",
    nameFr: "Giga 1 · Formation Cellules",
    lineEn: "Line A · 24-Channel SPC Rack",
    lineFr: "Ligne A · Rack SPC 24 Canaux",
    icon: Cpu,
  },
  {
    id: "cyclers",
    nameEn: "Pilot Line 2 · Cycler Lab",
    nameFr: "Ligne Pilote 2 · Cyclage Labo",
    lineEn: "Novonix & Neware High-Rate Testing",
    lineFr: "Tests Haut Régime Novonix & Neware",
    icon: LineChart,
  },
  {
    id: "btms",
    nameEn: "Thermal Bay 4 · BTMS Sim",
    nameFr: "Baie Thermique 4 · Sim BTMS",
    lineEn: "Bernardi Liquid Cooling Validation",
    lineFr: "Validation Refroidissement Liquide Bernardi",
    icon: Flame,
  },
];

export function WorkstationSwitcher() {
  const { workspace, setWorkspace } = useWorkstation();
  const { locale } = useLocale();
  const isFr = locale?.startsWith("fr");

  const current = facilities.find((f) => f.id === workspace) || facilities[0];
  const Icon = current.icon;
  const currentName = isFr ? current.nameFr : current.nameEn;
  const currentLine = isFr ? current.lineFr : current.lineEn;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentName}</span>
                <span className="text-muted-foreground truncate text-xs">{currentLine}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 rounded-lg">
            <DropdownMenuLabel>
              {isFr ? "Postes de Fabrication" : "Manufacturing Workstations"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {facilities.map((facility) => {
              const isActive = facility.id === workspace;
              const FacilityIcon = facility.icon;
              const name = isFr ? facility.nameFr : facility.nameEn;
              const line = isFr ? facility.lineFr : facility.lineEn;

              return (
                <DropdownMenuItem
                  key={facility.id}
                  className="cursor-pointer gap-2"
                  onClick={() => setWorkspace(facility.id)}
                >
                  <FacilityIcon className="size-4 text-muted-foreground" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-xs">{name}</p>
                      <p className="text-muted-foreground truncate text-[11px]">{line}</p>
                    </div>
                    {isActive ? <Check className="size-4 text-primary" /> : null}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
