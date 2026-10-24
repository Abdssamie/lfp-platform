import { useState } from "react";
import { Menu, LayoutDashboard, ChevronDown, X, Moon, Sun } from "lucide-react";
import { useIntlayer } from "react-intlayer";
import { Button } from "@convex-zen/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@convex-zen/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@convex-zen/ui/components/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@convex-zen/ui/components/collapsible";
import { Logo } from "@/components/logo";
import { MegaMenu } from "@/components/landing/mega-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTheme } from "@/hooks/use-theme";
import { LocalizedLink } from "@/components/localized-link";

const getNavigationItems = (content: any) => [
  { name: content.navbar.home, href: "#hero" },
  { name: content.navbar.features, href: "#features" },
  { name: content.navbar.solutions, href: "#features", hasMegaMenu: true },
  { name: content.navbar.team, href: "#team" },
  { name: content.navbar.pricing, href: "#pricing" },
  { name: content.navbar.faq, href: "#faq" },
  { name: content.navbar.contact, href: "#contact" },
];

// Solutions menu items for mobile
const getSolutionsItems = (content: any) => [
  { title: content.navbar.browseProducts },
  { name: content.navbar.freeBlocks, href: "#free-blocks" },
  { name: content.navbar.premiumTemplates, href: "#premium-templates" },
  { name: content.navbar.adminDashboards, href: "#admin-dashboards" },
  { name: content.navbar.landingPages, href: "#landing-pages" },
  { title: content.navbar.categories },
  { name: content.navbar.ecommerce, href: "#ecommerce" },
  { name: content.navbar.saasDashboards, href: "#saas-dashboards" },
  { name: content.navbar.analytics, href: "#analytics" },
  { name: content.navbar.authentication, href: "#authentication" },
  { title: content.navbar.resources },
  { name: content.navbar.documentation, href: "#docs" },
  { name: content.navbar.componentShowcase, href: "#showcase" },
  { name: content.navbar.githubRepo, href: "#github" },
  { name: content.navbar.designSystem, href: "#design-system" },
];

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith("#")) {
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
};

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const content = useIntlayer("landing");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <LocalizedLink to="/" className="flex items-center space-x-2 cursor-pointer">
            <Logo size={32} />
            <span className="font-bold">ConvexZen</span>
          </LocalizedLink>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {getNavigationItems(content).map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu />
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.href.startsWith("#")) {
                        smoothScrollTo(item.href);
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center space-x-2">
          <LocaleSwitcher />
          <ModeToggle variant="ghost" />

          <Button variant="outline" asChild className="cursor-pointer">
            <LocalizedLink to="/formation">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {content.navbar.dashboard}
            </LocalizedLink>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} />
                  </div>
                  <SheetTitle className="text-lg font-semibold">ConvexZen</SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <LocaleSwitcher />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="cursor-pointer h-8 w-8"
                    >
                      <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {getNavigationItems(content).map((item) => (
                    <div key={item.name}>
                      {item.hasMegaMenu ? (
                        <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            {item.name}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${solutionsOpen ? "rotate-180" : ""}`}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            {getSolutionsItems(content).map((solution, index) =>
                              solution.title ? (
                                <div
                                  key={`title-${index}`}
                                  className="px-4 mt-5 py-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  {solution.title}
                                </div>
                              ) : (
                                <a
                                  key={solution.name}
                                  href={solution.href}
                                  className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={(e) => {
                                    setIsOpen(false);
                                    if (solution.href?.startsWith("#")) {
                                      e.preventDefault();
                                      setTimeout(() => smoothScrollTo(solution.href), 100);
                                    }
                                  }}
                                >
                                  {solution.name}
                                </a>
                              ),
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            setIsOpen(false);
                            if (item.href.startsWith("#")) {
                              e.preventDefault();
                              setTimeout(() => smoothScrollTo(item.href), 100);
                            }
                          }}
                        >
                          {item.name}
                        </a>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <LocalizedLink to="/formation">
                    <LayoutDashboard className="size-4" />
                    {content.navbar.dashboard}
                  </LocalizedLink>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
