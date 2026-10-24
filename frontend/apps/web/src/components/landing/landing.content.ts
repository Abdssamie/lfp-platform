import { t, type Dictionary } from "intlayer";

export default {
  key: "landing",
  content: {
    seo: {
      title: t({
        en: "ConvexZen - Modern Web App Boilerplate",
        fr: "ConvexZen - Modèle d'application web moderne",
      }),
      description: t({
        en: "Ship web apps and SaaS faster with the lowest cost, modern tech stack. Built with React, TanStack Start, Convex, and more.",
        fr: "Déployez plus rapidement avec notre pile technologique moderne à moindre coût.",
      }),
      ogTitle: t({
        en: "ConvexZen - Ship Web Apps Faster",
        fr: "ConvexZen - Déployez plus rapidement",
      }),
      ogDescription: t({
        en: "The lowest cost, modern web app boilerplate to ship your SaaS. Built with React, TanStack Start, Convex, and more.",
        fr: "Le modèle d'application web moderne pour déployer votre SaaS.",
      }),
    },
    hero: {
      badge: t({
        en: "New: Premium Template Collection",
        fr: "Nouveau : Collection de modèles premium",
      }),
      titlePart1: t({ en: "Build Better", fr: "Créez de meilleures" }),
      titleHighlight: t({ en: " Web Applications ", fr: " Applications Web " }),
      titlePart2: t({ en: "with Convex & Better Auth", fr: "avec Convex & Better Auth" }),
      description: t({
        en: "ConvexZen is a production-ready boilerplate with Convex, Better Auth, TanStack Router, and Lucide Icons. Accelerate your development with our curated collection of blocks and templates.",
        fr: "ConvexZen est un modèle prêt pour la production avec Convex, Better Auth, TanStack Router et Lucide Icons.",
      }),
      getStartedFree: t({ en: "Get Started Free", fr: "Commencez gratuitement" }),
      watchDemo: t({ en: "Watch Demo", fr: "Voir la démo" }),
    },
    navbar: {
      home: t({ en: "Home", fr: "Accueil" }),
      features: t({ en: "Features", fr: "Fonctionnalités" }),
      solutions: t({ en: "Solutions", fr: "Solutions" }),
      team: t({ en: "Team", fr: "Équipe" }),
      pricing: t({ en: "Pricing", fr: "Tarification" }),
      faq: t({ en: "FAQ", fr: "FAQ" }),
      contact: t({ en: "Contact", fr: "Contact" }),
      dashboard: t({ en: "Dashboard", fr: "Tableau de bord" }),
      signIn: t({ en: "Sign In", fr: "Connexion" }),
      getStarted: t({ en: "Get Started", fr: "Commencer" }),
      browseProducts: t({ en: "Browse Products", fr: "Parcourir les produits" }),
      freeBlocks: t({ en: "Free Blocks", fr: "Blocs Gratuits" }),
      premiumTemplates: t({ en: "Premium Templates", fr: "Modèles Premium" }),
      adminDashboards: t({ en: "Admin Dashboards", fr: "Tableaux de Bord Admin" }),
      landingPages: t({ en: "Landing Pages", fr: "Pages de Destination" }),
      categories: t({ en: "Categories", fr: "Catégories" }),
      ecommerce: t({ en: "E-commerce", fr: "E-commerce" }),
      saasDashboards: t({ en: "SaaS Dashboards", fr: "Tableaux de Bord SaaS" }),
      analytics: t({ en: "Analytics", fr: "Analytique" }),
      authentication: t({ en: "Authentication", fr: "Authentification" }),
      resources: t({ en: "Resources", fr: "Ressources" }),
      documentation: t({ en: "Documentation", fr: "Documentation" }),
      componentShowcase: t({ en: "Component Showcase", fr: "Vitrine de Composants" }),
      githubRepo: t({ en: "GitHub Repository", fr: "Dépôt GitHub" }),
      designSystem: t({ en: "Design System", fr: "Système de Design" }),
    },
  },
} satisfies Dictionary;
