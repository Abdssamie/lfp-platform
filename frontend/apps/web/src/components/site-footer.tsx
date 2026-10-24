import { ShieldCheck, Cpu } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">
              LFP Battery Analytics & Formation Platform
            </span>
            <span className="hidden md:inline">· IATF 16949 SPC & Bernardi ODE Physics Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Automotive Quality Standard
            </span>
            <span>Build v0.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
