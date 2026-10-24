"use client";

import { ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@convex-zen/ui/components/button";
import { Badge } from "@convex-zen/ui/components/badge";
import { DotPattern } from "@/components/dot-pattern";
import { assetUrl } from "@/lib/utils";
import { LocalizedLink } from "@/components/localized-link";
import { useIntlayer } from "react-intlayer";

export function HeroSection() {
  const content = useIntlayer("landing");

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Dot pattern overlay using reusable component */}
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground">
              <Star className="w-3 h-3 mr-2 fill-current" />
              {content.hero.badge}
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {content.hero.titlePart1}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {content.hero.titleHighlight}
            </span>
            {content.hero.titlePart2}
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {content.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <LocalizedLink to="/formation">
                {content.hero.getStartedFree}
                <ArrowRight className="ml-2 h-4 w-4" />
              </LocalizedLink>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <a href="#">
                <Play className="mr-2 h-4 w-4" />
                {content.hero.watchDemo}
              </a>
            </Button>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative group">
            {/* Top background glow effect - positioned above the image */}
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>

            <div className="relative rounded-xl border bg-card shadow-2xl">
              {/* Light mode dashboard image */}
              <img
                src={assetUrl("dashboard-light.png")}
                alt="Dashboard Preview - Light Mode"
                className="w-full rounded-xl object-cover block dark:hidden"
              />

              {/* Dark mode dashboard image */}
              <img
                src={assetUrl("dashboard-dark.png")}
                alt="Dashboard Preview - Dark Mode"
                className="w-full rounded-xl object-cover hidden dark:block"
              />

              {/* Bottom fade effect - gradient overlay that fades the image to background */}
              <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 lg:h-48 bg-gradient-to-b from-background/0 via-background/70 to-background rounded-b-xl"></div>

              {/* Overlay play button for demo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 p-0 cursor-pointer hover:scale-105 transition-transform"
                  asChild
                >
                  <a href="#" aria-label="Watch demo video">
                    <Play className="h-6 w-6 fill-current" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
