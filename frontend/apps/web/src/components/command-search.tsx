"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Search,
  Cpu,
  LineChart,
  Flame,
  ShieldCheck,
  Layers,
  BarChart3,
  Hash,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useWorkstation } from "@/contexts/workstation-context";
import { usePlatformTranslation } from "@/lib/translations";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-12 w-full border-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground border-b border-border mb-2",
      className,
    )}
    {...props}
  />
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[350px] overflow-y-auto overflow-x-hidden p-2", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-xs text-muted-foreground"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&:not(:first-child)]:mt-2",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-md px-3 text-xs text-foreground outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const { setWorkspace, setDataset, setSelectedChannel } = useWorkstation();
  const { t, isFr } = usePlatformTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-xl border max-w-[560px]">
        <DialogTitle className="sr-only">Command Search</DialogTitle>
        <Command>
          <CommandInput placeholder={t.search.placeholder} autoFocus />
          <CommandList>
            <CommandEmpty>{t.search.emptyText}</CommandEmpty>

            <CommandGroup heading={t.search.workstationsHeading}>
              <CommandItem
                onSelect={() => {
                  setWorkspace("formation");
                  onOpenChange(false);
                }}
              >
                <Cpu className="mr-2 h-4 w-4 text-primary" />
                <span>
                  {isFr
                    ? "Ligne de Formation SPC (Rack 24 canaux)"
                    : "Formation Line SPC (24-Channel Rack)"}
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setWorkspace("cyclers");
                  onOpenChange(false);
                }}
              >
                <LineChart className="mr-2 h-4 w-4 text-primary" />
                <span>
                  {isFr
                    ? "Courbes Cyclage Laboratoire (Novonix & Neware)"
                    : "Cycler Lab Curves (Novonix & Neware)"}
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setWorkspace("btms");
                  onOpenChange(false);
                }}
              >
                <Flame className="mr-2 h-4 w-4 text-primary" />
                <span>
                  {isFr
                    ? "Simulateur Thermique BTMS (Bilan Bernardi ODE)"
                    : "BTMS Thermal Simulator (Bernardi ODE RK45)"}
                </span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading={t.search.cyclerDatasetsHeading}>
              <CommandItem
                onSelect={() => {
                  setWorkspace("cyclers");
                  setDataset("novonix");
                  onOpenChange(false);
                }}
              >
                <Layers className="mr-2 h-4 w-4 text-blue-500" />
                <span>
                  {isFr
                    ? "Banc Novonix Haute Précision (Cellule #8001)"
                    : "Novonix High-Precision Cycler (Cell #8001)"}
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setWorkspace("cyclers");
                  setDataset("neware");
                  onOpenChange(false);
                }}
              >
                <Layers className="mr-2 h-4 w-4 text-emerald-500" />
                <span>
                  {isFr
                    ? "Charge Rapide Multi-Régimes Neware (0.5C - 3C)"
                    : "Neware Multi-Rate Fast Charge (0.5C - 3C)"}
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setWorkspace("cyclers");
                  setDataset("lfp");
                  onOpenChange(false);
                }}
              >
                <Layers className="mr-2 h-4 w-4 text-purple-500" />
                <span>
                  {isFr
                    ? "Données Cellule Prismatique LFP 50Ah"
                    : "Commercial Prismatic LFP 50Ah Dataset"}
                </span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading={t.search.channelInspectionHeading}>
              {[1, 5, 8, 12, 14, 20].map((ch) => (
                <CommandItem
                  key={ch}
                  onSelect={() => {
                    setWorkspace("formation");
                    setSelectedChannel(ch);
                    onOpenChange(false);
                  }}
                >
                  <Hash className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {t.search.inspectChannel} {ch} {ch === 14 ? t.search.quarantinedScrap : t.search.tested}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading={t.search.iatfStandardsHeading}>
              <CommandItem
                onSelect={() => {
                  setWorkspace("formation");
                  onOpenChange(false);
                }}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                <span>
                  {isFr
                    ? "Matrice de Tri K-value vs DCIR (Limites Quadrants)"
                    : "K-value vs DCIR Screening Plot (Quadrant Boundary)"}
                </span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setWorkspace("formation");
                  onOpenChange(false);
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                <span>
                  {isFr
                    ? "Carte de Contrôle SPC Shewhart (Limites UCL / LCL)"
                    : "Shewhart SPC Run Chart (X-bar / R Limits)"}
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { t } = usePlatformTranslation();

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 px-2.5 py-1 relative w-full justify-start text-muted-foreground cursor-pointer"
    >
      <Search className="mr-1.5 h-3.5 w-3.5" />
      <span className="hidden sm:inline-flex">{t.common.searchPlaceholder}</span>
      <span className="inline-flex sm:hidden">{t.common.searchMobile}</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  );
}
