"use client";

import { Check } from "lucide-react";
import { Badge } from "@convex-zen/ui/components/badge";
import { Button } from "@convex-zen/ui/components/button";
import { LocalizedLink } from "@/components/localized-link";

const PLANS = [
  {
    id: "pilot",
    name: "Lab Bench Pilot",
    description: "Designed for small research cells and single cycler channels.",
    price: "Community Core",
    badge: null,
    features: [
      "Up to 8 active cycler channels",
      "Novonix & Neware CSV parsing",
      "Basic V-Q voltage curves",
      "Local browser storage",
    ],
  },
  {
    id: "plant",
    name: "Industrial Formation Line",
    description: "Full production pilot line quality grading and statistical process control.",
    price: "Standard Deployment",
    badge: "Most Popular",
    features: [
      "24-Channel Cabinet live rack inspection",
      "Real-time IATF 16949 Cpk quality gates",
      "Automated Lot Quarantine triggers",
      "dQ/dV differential capacity spline engine",
      "Native FastAPI numerical backend",
    ],
  },
  {
    id: "enterprise",
    name: "Full Giga Factory & BTMS",
    description: "Integrated thermal simulation and automated grading across multiple lines.",
    price: "Enterprise Node",
    badge: null,
    features: [
      "Multi-cabinet formation monitoring",
      "Coupled 1D BTMS Bernardi solver (SciPy RK45)",
      "Transient core & surface temperature curves",
      "Direct database & equipment integration",
      "Dedicated air/liquid chiller thermal maps",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/40 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Deployment Tiers
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Modular Industrial Architecture
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Zero cloud bloat. Run completely on-premise connected directly to your formation line PLCs and cyclers.
          </p>
        </div>

        <div className="mx-auto max-w-6xl rounded-xl border">
          <div className="grid lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className="grid gap-6 p-8 border-b lg:border-b-0 lg:border-r last:border-r-0"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-medium tracking-tight">{plan.name}</div>
                    {plan.badge ? (
                      <Badge variant="secondary" className="text-xs">
                        {plan.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{plan.description}</div>
                </div>

                <div>
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">Standalone local engine</div>
                </div>

                <div>
                  <Button className="w-full" variant={plan.badge ? "default" : "outline"} asChild>
                    <LocalizedLink to="/dashboard">Open Dashboard</LocalizedLink>
                  </Button>
                </div>

                <div>
                  <ul role="list" className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="size-4 flex-shrink-0 text-emerald-500" strokeWidth={2.5} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
