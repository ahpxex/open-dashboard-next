import type { Icon } from "@phosphor-icons/react";

import {
  FileTextIcon,
  GearIcon,
  HouseIcon,
  PackageIcon,
  WarningIcon,
} from "@phosphor-icons/react";

export interface MenuItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface MenuGroup {
  groupLabel?: string;
  items: MenuItem[];
}

export const mainMenuItems: MenuGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: HouseIcon },
      { label: "Products", href: "/products", icon: PackageIcon },
      { label: "Orders", href: "/orders", icon: PackageIcon },
      { label: "Posts", href: "/posts", icon: FileTextIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
  {
    groupLabel: "Error Pages",
    items: [
      { label: "Unauthorized", href: "/errors/401", icon: WarningIcon },
      { label: "Forbidden", href: "/errors/403", icon: WarningIcon },
      { label: "Not Found", href: "/errors/404", icon: WarningIcon },
      { label: "Server Error", href: "/errors/500", icon: WarningIcon },
      { label: "Maintenance", href: "/errors/503", icon: WarningIcon },
    ],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
