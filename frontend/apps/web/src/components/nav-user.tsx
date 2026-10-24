"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent cursor-default select-none gap-2.5"
        >
          <Avatar className="size-8 rounded-lg border border-border shrink-0">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-lg text-xs font-mono font-medium">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium text-foreground">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs font-mono">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
