"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { LocalizedLink, type To } from "@/components/localized-link";
import { useLocation } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  label,
  items,
}: {
  label: string;
  items: {
    title: string;
    url: To;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: To;
      isActive?: boolean;
    }[];
  }[];
}) {
  const location = useLocation();
  const strippedPathname = getPathWithoutLocale(location.pathname) || "/";

  // Check if any subitem is active to determine if parent should be open
  const shouldBeOpen = (item: (typeof items)[0]) => {
    if (item.isActive) return true;
    return item.items?.some((subItem) => strippedPathname === subItem.url) || false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={shouldBeOpen(item)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="cursor-pointer"
                            isActive={strippedPathname === subItem.url}
                          >
                            <LocalizedLink to={subItem.url}>
                              <span>{subItem.title}</span>
                            </LocalizedLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="cursor-pointer"
                  isActive={strippedPathname === item.url}
                >
                  <LocalizedLink to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </LocalizedLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
