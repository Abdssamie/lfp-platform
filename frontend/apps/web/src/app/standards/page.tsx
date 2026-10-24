"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Layers, Flame } from "lucide-react";

export default function StandardsPage() {
  return (
    <BaseLayout
      title="Normes de Fabrication & Conformité Qualité"
      description="Spécifications IATF 16949, Méthodologies de Cyclage IEC 62660-1 et Critères Thermiques SAE J2464"
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* IATF 16949 Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  IATF 16949 — Contrôle Qualité & Capabilité Procédé
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                <CheckCircle2 className="size-3" />
                Conforme Automotive
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Exigences pour la qualification des cellules prismatiques LFP en ligne de gigafactory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Indice de Capabilité Cpk</span>
                <p className="text-muted-foreground">Cible minimale: &gt; 1.33 (Statut actuel: 1.42). Tolérance 6-Sigma validée.</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Seuil K-Value (Auto-décharge)</span>
                <p className="text-muted-foreground">K &lt; 2.0 mV/jour après 14 jours de vieillissement thermique à 25°C.</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Seuil DCIR (Résistance Interne)</span>
                <p className="text-muted-foreground">DCIR &lt; 35.0 mΩ sous impulsion 10s à 50% SOC (1C / 25°C).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IEC 62660-1 Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  IEC 62660-1 — Éléments Li-ion pour Véhicules Électriques
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                Protocole Actif
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Régimes de vieillissement accéléré, dQ/dV et dégradation de capacité sous cyclage sévère.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Régimes de Charge / Décharge</span>
                <p className="text-muted-foreground">Tests de 0.5C à 3.0C avec coupure standard 2.0V – 3.65V (Chimie LFP).</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Rétention de Capacité EOL</span>
                <p className="text-muted-foreground">Critère de fin de vie: 80% de la capacité nominale initiale (50.0 Ah $\rightarrow$ 40.0 Ah).</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Analyse Différentielle dQ/dV</span>
                <p className="text-muted-foreground">Suivi des pics de transition de phase biphasique LiFePO4 $\leftrightarrow$ FePO4.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAE J2464 Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-foreground" />
                <CardTitle className="text-base font-semibold">
                  SAE J2464 — Sécurité & Gestion Thermique BTMS
                </CardTitle>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                Contrôle Thermique
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Limites de gradient thermique et température crête pour prévenir tout risque d'emballement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Gradient Inter-cellulaire Max</span>
                <p className="text-muted-foreground">ΔT &lt; 3.0°C entre cellules du module sous charge rapide 2C.</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Température Crête Admissible</span>
                <p className="text-muted-foreground">T_max &lt; 45.0°C au cœur de cellule (solveur RK45 couplé avec Bernardi).</p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 space-y-1">
                <span className="font-semibold text-foreground">Fluide Caloporteur</span>
                <p className="text-muted-foreground">Mélange Eau-Éthylène Glycol 50/50 avec débit régulé de 2 à 10 LPM.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
