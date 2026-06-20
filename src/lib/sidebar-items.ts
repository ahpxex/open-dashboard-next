import type { Icon } from "@phosphor-icons/react";

import {
  AddressBookIcon,
  ArrowsClockwiseIcon,
  BellRingingIcon,
  BookmarkSimpleIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CardsIcon,
  ChartBarIcon,
  ChartLineUpIcon,
  ChatCircleIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  ColumnsIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  FingerprintIcon,
  FunnelIcon,
  GearIcon,
  HandshakeIcon,
  HouseIcon,
  IdentificationCardIcon,
  InfinityIcon,
  KanbanIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PencilSimpleIcon,
  PulseIcon,
  ReceiptIcon,
  RowsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SquareHalfIcon,
  SquaresFourIcon,
  StackIcon,
  StepsIcon,
  TableIcon,
  TranslateIcon,
  TrayIcon,
  TreeStructureIcon,
  UploadSimpleIcon,
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

/**
 * The sidebar has two halves:
 *
 * 1. **Business cases** — complete, believable back-offices that *compose* the
 *    skill shapes into real verticals. Two ship by default: `E-commerce`
 *    (products / orders / customers / refunds + the home dashboard + blog) and
 *    `Sales (CRM)` (forecast / pipeline / contacts / companies). They double as
 *    the live demos for the foundational archetype skills (CRUD, detail,
 *    master-detail, card-list, chart-page).
 *
 * 2. **Skills Gallery** — one entry per skill, grouped by category
 *    (`Skills · …`). Each entry is the skill's own demo route under
 *    `/gallery/*`, so the sidebar *is* the proof that every skill produces
 *    working UI. The `Skills Gallery · Overview` entry opens the full catalogue
 *    (including shape variants not pinned here).
 *
 * Generated CRUD resources are inserted at `create-resource:anchor` (they land
 * in the first business group). New business-case groups go above the
 * `gallery:anchor` line; the `Skills · …` groups stay last.
 */
export const mainMenuItems: MenuGroup[] = [
  {
    groupLabel: "E-commerce",
    items: [
      { label: "Overview", href: "/", icon: HouseIcon },
      { label: "Products", href: "/products", icon: PackageIcon },
      { label: "Orders", href: "/orders", icon: ReceiptIcon },
      { label: "Customers", href: "/customers", icon: AddressBookIcon },
      { label: "Refunds", href: "/refunds", icon: ArrowsClockwiseIcon },
      { label: "Blog", href: "/posts", icon: FileTextIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
  {
    groupLabel: "Sales (CRM)",
    items: [
      { label: "Forecast", href: "/crm", icon: ChartLineUpIcon },
      { label: "Pipeline", href: "/crm/deals", icon: HandshakeIcon },
      {
        label: "Contacts",
        href: "/crm/contacts",
        icon: IdentificationCardIcon,
      },
      { label: "Companies", href: "/crm/companies", icon: BuildingsIcon },
    ],
  },
  // gallery:anchor (keep this line — new business-case groups go above; Skills groups stay last)
  {
    groupLabel: "Skills Gallery",
    items: [{ label: "Overview", href: "/gallery", icon: SquaresFourIcon }],
  },
  {
    groupLabel: "Skills · Forms",
    items: [
      {
        label: "Full-page form",
        href: "/gallery/form-page",
        icon: FileTextIcon,
      },
      {
        label: "Wizard / stepper",
        href: "/gallery/form-wizard",
        icon: StepsIcon,
      },
      {
        label: "Searchable select",
        href: "/gallery/form-combobox",
        icon: MagnifyingGlassIcon,
      },
      {
        label: "File upload",
        href: "/gallery/file-upload",
        icon: UploadSimpleIcon,
      },
    ],
  },
  {
    groupLabel: "Skills · Lists & tables",
    items: [
      { label: "List view", href: "/gallery/list-lite", icon: RowsIcon },
      {
        label: "Infinite list",
        href: "/gallery/list-infinite",
        icon: InfinityIcon,
      },
      {
        label: "Virtualized table",
        href: "/gallery/table-virtual",
        icon: TableIcon,
      },
      {
        label: "Inline-edit table",
        href: "/gallery/table-inline-edit",
        icon: PencilSimpleIcon,
      },
      {
        label: "Filter panel",
        href: "/gallery/filter-panel",
        icon: FunnelIcon,
      },
      {
        label: "CSV export & import",
        href: "/gallery/export-import",
        icon: DownloadSimpleIcon,
      },
      {
        label: "Column controls",
        href: "/gallery/table-columns",
        icon: ColumnsIcon,
      },
      {
        label: "Saved views",
        href: "/gallery/saved-views",
        icon: BookmarkSimpleIcon,
      },
      { label: "Live / realtime", href: "/gallery/realtime", icon: PulseIcon },
      {
        label: "Global search",
        href: "/gallery/global-search",
        icon: MagnifyingGlassIcon,
      },
    ],
  },
  {
    groupLabel: "Skills · Rich views",
    items: [
      { label: "Kanban board", href: "/gallery/kanban", icon: KanbanIcon },
      { label: "Tree view", href: "/gallery/tree", icon: TreeStructureIcon },
      { label: "Calendar", href: "/gallery/calendar", icon: CalendarBlankIcon },
      { label: "Timeline", href: "/gallery/timeline", icon: ClockIcon },
    ],
  },
  {
    groupLabel: "Skills · Detail & pages",
    items: [
      { label: "Tabbed record", href: "/gallery/record-tabs", icon: CardsIcon },
      {
        label: "Related records",
        href: "/gallery/related-records",
        icon: StackIcon,
      },
      {
        label: "Control / settings",
        href: "/gallery/control-page",
        icon: SlidersHorizontalIcon,
      },
      { label: "Empty state", href: "/gallery/empty-state", icon: TrayIcon },
      {
        label: "Split layout",
        href: "/gallery/split-layout",
        icon: SquareHalfIcon,
      },
      {
        label: "Roles & permissions",
        href: "/gallery/rbac",
        icon: ShieldCheckIcon,
      },
      {
        label: "Sign-in methods",
        href: "/gallery/auth-methods",
        icon: FingerprintIcon,
      },
      {
        label: "Billing & plans",
        href: "/gallery/billing",
        icon: CreditCardIcon,
      },
      {
        label: "Internationalization",
        href: "/gallery/localization",
        icon: TranslateIcon,
      },
    ],
  },
  {
    groupLabel: "Skills · Display & feedback",
    items: [
      {
        label: "Data display",
        href: "/gallery/data-display",
        icon: ChartBarIcon,
      },
      {
        label: "Feedback & overlays",
        href: "/gallery/feedback",
        icon: ChatCircleIcon,
      },
      {
        label: "Notification center",
        href: "/gallery/notifications",
        icon: BellRingingIcon,
      },
      {
        label: "Audit log",
        href: "/gallery/audit-log",
        icon: ClockCounterClockwiseIcon,
      },
    ],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
