import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@convex-zen/ui/components/button";
import { Badge } from "@convex-zen/ui/components/badge";

export default function Billing() {
  return (
    <section className="rounded-lg border p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Industrial License & Workstations</h2>
          <p className="text-sm text-muted-foreground">
            On-premise deployment mode: standalone local engine with unlimited cell channels.
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
          Enterprise Industrial Tier
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Formation Line SPC</h3>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            24-Channel Cabinet live rack, real-time grading, capacity screening, and IATF 16949 Cpk reports.
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Full 24-channel inspection
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Automated Lot Quarantine
            </li>
          </ul>
        </article>

        <article className="rounded-md border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Cycler Lab Curves</h3>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Novonix, Neware, and commercial cell telemetry parsers with dQ/dV differential capacity derivatives.
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Parquet / CSV telemetry
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> V-Q & dQ/dV spline engine
            </li>
          </ul>
        </article>

        <article className="rounded-md border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">BTMS Simulator</h3>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            Coupled 1D two-state Bernardi heat generation with SciPy RK45 transient thermal ODE integration.
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground pt-2">
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Liquid cooling plates
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500" /> Real-time thermal gradients
            </li>
          </ul>
        </article>
      </div>

      <div className="pt-2">
        <Button variant="outline" size="sm" disabled>
          Active License: Enterprise Local Core (Unlimited Nodes)
        </Button>
      </div>
    </section>
  );
}
