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

// Whether `href` matches the current path (exact, or a parent of a nested route).
// `/` only matches exactly so the home item doesn't shadow every route.
function hrefMatches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The single active nav item: the LONGEST matching href wins. So on
// `/gallery/kanban` the "Kanban" item is active rather than the `/gallery`
// overview, while `/products/123` still keeps "Products" highlighted.
function activeHrefFor(pathname: string, hrefs: string[]): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    if (
      hrefMatches(pathname, href) &&
      (best === null || href.length > best.length)
    ) {
      best = href;
    }
  }
  return best;
}

// Active state: monochrome but clearly heavier than the bare accent — the
// accent fill + bold full-strength text + a high-contrast 3px left indicator bar
// (inset shadow, so it adds no layout shift). The button sits at a CONSTANT
// `+0.5rem` right bleed (eating the group's right padding) so the active fill and
// the hover highlight are flush against the sidebar's right edge while keeping the
// left inset + bar — an intentional, anchored look. The width is applied always
// (not gated on `:hover` / `:data-active`), so on hover the background just fills
// in place instead of animating its width outward — the button keeps its
// `transition-[width]` for the collapse/expand animation, but it does not fire on
// hover. All from sidebar theme tokens, so it follows dark mode + rebrand with no
// hardcoded colour. Dials: the `+0.5rem` right bleed, the 3px bar width, or the
// bar colour token, for more/less weight. (Collapsed icon rail forces `size-8!`,
// so the widen is a no-op there.)
const ACTIVE_CLASSES =
  "w-[calc(100%+0.5rem)] data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:shadow-[inset_3px_0_0_0_var(--sidebar-foreground)] data-active:hover:bg-sidebar-accent";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeHref = activeHrefFor(pathname, [
    ...appConfig.nav.main.flatMap((group) => group.items.map((i) => i.href)),
    ...appConfig.nav.bottom.map((i) => i.href),
  ]);

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = item.href === activeHref;

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
