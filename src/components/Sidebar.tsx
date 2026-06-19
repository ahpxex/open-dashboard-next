import { Link, useRouterState } from "@tanstack/react-router";
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
import { appConfig } from "@/config/app";
import type { MenuItem } from "@/lib/sidebar-items";

// A nav item is active for its own route and any route nested beneath it, so
// e.g. `/products/123` keeps "Products" highlighted. `/` only matches exactly.
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Active state: monochrome but clearly heavier than the bare accent — the
// accent fill + bold full-strength text + a high-contrast 3px left indicator bar
// (inset shadow, so it adds no layout shift). All from sidebar theme tokens, so
// it follows dark mode + rebrand with no hardcoded colour. Dials: widen the 3px
// bar, or swap the bar colour token, for more/less weight.
const ACTIVE_CLASSES =
  "data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:shadow-[inset_3px_0_0_0_var(--sidebar-foreground)] data-active:hover:bg-sidebar-accent";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = isActivePath(pathname, item.href);

    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          className={ACTIVE_CLASSES}
          render={
            <Link to={item.href}>
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
        <span className="truncate px-1 text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
          {appConfig.name}
        </span>
      </SidebarHeader>

      <SidebarContent>
        {appConfig.nav.main.map((group, groupIndex) => (
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

      {appConfig.nav.bottom.length > 0 && (
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>{appConfig.nav.bottom.map(renderMenuItem)}</SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
