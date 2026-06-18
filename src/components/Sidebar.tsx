"use client";

import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  bottomMenuItems,
  type MenuItem,
  mainMenuItems,
} from "@/lib/sidebar-items";

// Strong, sharp active state that matches the app's primary colour and stays
// solid on hover (overrides the design-system's subtle accent active style).
const ACTIVE_CLASSES =
  "data-active:bg-primary data-active:font-medium data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground";

export function AppSidebar() {
  const pathname = usePathname();

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          className={ACTIVE_CLASSES}
          render={
            <Link href={item.href}>
              <Icon weight={isActive ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          }
        />
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground">
            <SquaresFourIcon size={18} weight="fill" />
          </div>
          <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            The System
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {mainMenuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.groupLabel ?? `group-${groupIndex}`}>
            {group.groupLabel && (
              <SidebarGroupLabel>{group.groupLabel}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {bottomMenuItems.length > 0 && (
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>{bottomMenuItems.map(renderMenuItem)}</SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
