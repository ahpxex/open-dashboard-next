import type { Icon } from "@phosphor-icons/react";

import {
  FileTextIcon,
  GearIcon,
  HouseIcon,
  NotePencilIcon,
  PackageIcon,
  SquaresFourIcon,
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
  // gallery:anchor (keep this line — gallery groups below; `trim-gallery` removes them)
  {
    groupLabel: "Gallery",
    items: [{ label: "Overview", href: "/gallery", icon: SquaresFourIcon }],
  },
  {
    groupLabel: "Gallery · Forms",
    items: [
      {
        label: "Full-page form",
        href: "/gallery/form-page",
        icon: NotePencilIcon,
      },
      {
        label: "Scrollable form",
        href: "/gallery/form-scroll",
        icon: NotePencilIcon,
      },
      {
        label: "Compact form",
        href: "/gallery/form-fixed",
        icon: NotePencilIcon,
      },
      {
        label: "Wizard / stepper",
        href: "/gallery/form-wizard",
        icon: NotePencilIcon,
      },
      {
        label: "Field array",
        href: "/gallery/form-array",
        icon: NotePencilIcon,
      },
      {
        label: "Custom actions",
        href: "/gallery/form-actions",
        icon: NotePencilIcon,
      },
      {
        label: "Searchable select",
        href: "/gallery/form-combobox",
        icon: NotePencilIcon,
      },
    ],
  },
  {
    groupLabel: "Gallery · Lists & tables",
    items: [
      {
        label: "List view (dense)",
        href: "/gallery/list-lite",
        icon: SquaresFourIcon,
      },
      {
        label: "Infinite list",
        href: "/gallery/list-infinite",
        icon: SquaresFourIcon,
      },
      { label: "Lazy list", href: "/gallery/list-lazy", icon: SquaresFourIcon },
      {
        label: "Virtualized table",
        href: "/gallery/table-virtual",
        icon: SquaresFourIcon,
      },
      {
        label: "Inline-edit table",
        href: "/gallery/table-inline-edit",
        icon: SquaresFourIcon,
      },
      {
        label: "Filter panel",
        href: "/gallery/filter-panel",
        icon: SquaresFourIcon,
      },
    ],
  },
  {
    groupLabel: "Gallery · Rich views",
    items: [
      { label: "Kanban board", href: "/gallery/kanban", icon: SquaresFourIcon },
      { label: "Tree view", href: "/gallery/tree", icon: SquaresFourIcon },
      { label: "Calendar", href: "/gallery/calendar", icon: SquaresFourIcon },
      { label: "Timeline", href: "/gallery/timeline", icon: SquaresFourIcon },
    ],
  },
  {
    groupLabel: "Gallery · Detail & pages",
    items: [
      {
        label: "Tabbed record",
        href: "/gallery/record-tabs",
        icon: FileTextIcon,
      },
      {
        label: "Detail + related",
        href: "/gallery/detail-related",
        icon: FileTextIcon,
      },
      {
        label: "Control / settings",
        href: "/gallery/control-page",
        icon: FileTextIcon,
      },
      { label: "Profile", href: "/gallery/profile", icon: FileTextIcon },
      {
        label: "Empty state",
        href: "/gallery/empty-state",
        icon: FileTextIcon,
      },
      {
        label: "Split layout",
        href: "/gallery/split-layout",
        icon: FileTextIcon,
      },
    ],
  },
  {
    groupLabel: "Gallery · Display & feedback",
    items: [
      {
        label: "Data display",
        href: "/gallery/data-display",
        icon: SquaresFourIcon,
      },
      {
        label: "Feedback & overlays",
        href: "/gallery/feedback",
        icon: SquaresFourIcon,
      },
    ],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
