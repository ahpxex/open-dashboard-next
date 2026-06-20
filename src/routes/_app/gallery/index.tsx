import type { Icon } from "@phosphor-icons/react";
import {
  BellIcon,
  BellRingingIcon,
  BookmarkSimpleIcon,
  CalendarBlankIcon,
  CardsIcon,
  CaretRightIcon,
  ChartBarIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  ColumnsIcon,
  CursorClickIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  FingerprintIcon,
  FunnelIcon,
  HourglassIcon,
  InfinityIcon,
  KanbanIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PulseIcon,
  RowsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  StackIcon,
  StepsIcon,
  TableIcon,
  TrayIcon,
  TreeStructureIcon,
  UploadSimpleIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Gallery Overview — the single entry point for the UI-shape palette.
 *
 * Every shape below is a self-contained, zero-config demo route under
 * `src/routes/_app/gallery/*`. They are kept out of the sidebar (only this
 * Overview is listed) and surfaced here, grouped into URL-synced tabs. Each
 * card links to the full demo. The business-scenario dashboards in the sidebar
 * show these shapes *composed* into real products; this page is the catalogue
 * you pick from. On port, keep what you need and run `trim-gallery`.
 */

type CategoryKey = "forms" | "lists" | "rich" | "pages" | "feedback";

const tabSchema = z.object({
  tab: z
    .enum(["forms", "lists", "rich", "pages", "feedback"])
    .default("forms")
    .catch("forms"),
});

export const Route = createFileRoute("/_app/gallery/")({
  validateSearch: tabSchema,
  component: GalleryOverview,
});

const CATEGORIES: { key: CategoryKey; label: string; icon: Icon }[] = [
  { key: "forms", label: "Forms", icon: NotePencilIcon },
  { key: "lists", label: "Lists & tables", icon: TableIcon },
  { key: "rich", label: "Rich views", icon: KanbanIcon },
  { key: "pages", label: "Detail & pages", icon: CardsIcon },
  { key: "feedback", label: "Display & feedback", icon: BellIcon },
];

type Shape = {
  category: CategoryKey;
  title: string;
  description: string;
  href: string;
  icon: Icon;
};

const SHAPES: Shape[] = [
  // Forms
  {
    category: "forms",
    title: "Full-page form",
    description: "A create form on its own route, with cancel / submit.",
    href: "/gallery/form-page",
    icon: FileTextIcon,
  },
  {
    category: "forms",
    title: "Scrollable form",
    description:
      "Long form with a sticky header / footer and a scrolling body.",
    href: "/gallery/form-scroll",
    icon: NotePencilIcon,
  },
  {
    category: "forms",
    title: "Compact form",
    description: "Dense form that fits the viewport with no scrolling.",
    href: "/gallery/form-fixed",
    icon: RowsIcon,
  },
  {
    category: "forms",
    title: "Wizard / stepper",
    description: "Multi-step form with per-step validation and progress.",
    href: "/gallery/form-wizard",
    icon: StepsIcon,
  },
  {
    category: "forms",
    title: "Field array",
    description: "Repeatable row groups you can add and remove.",
    href: "/gallery/form-array",
    icon: ListBulletsIcon,
  },
  {
    category: "forms",
    title: "Custom actions",
    description: "Configurable footer / toolbar action buttons.",
    href: "/gallery/form-actions",
    icon: CursorClickIcon,
  },
  {
    category: "forms",
    title: "Searchable select",
    description: "Combobox with a filterable, async-friendly option list.",
    href: "/gallery/form-combobox",
    icon: MagnifyingGlassIcon,
  },
  {
    category: "forms",
    title: "File upload",
    description:
      "Drag-and-drop upload with thumbnails and a swappable storage seam.",
    href: "/gallery/file-upload",
    icon: UploadSimpleIcon,
  },
  // Lists & tables
  {
    category: "lists",
    title: "List view (dense)",
    description: "Compact rows with a leading avatar and secondary text.",
    href: "/gallery/list-lite",
    icon: ListBulletsIcon,
  },
  {
    category: "lists",
    title: "Infinite list",
    description: "Load-more / infinite scroll instead of a numbered pager.",
    href: "/gallery/list-infinite",
    icon: InfinityIcon,
  },
  {
    category: "lists",
    title: "Lazy list",
    description: "Sections that defer-load their contents on first expand.",
    href: "/gallery/list-lazy",
    icon: HourglassIcon,
  },
  {
    category: "lists",
    title: "Virtualized table",
    description: "Windowed rows that stay smooth with thousands of records.",
    href: "/gallery/table-virtual",
    icon: TableIcon,
  },
  {
    category: "lists",
    title: "Inline-edit table",
    description: "Edit cells in place; commit on blur / Enter, revert on Esc.",
    href: "/gallery/table-inline-edit",
    icon: PencilSimpleIcon,
  },
  {
    category: "lists",
    title: "Filter panel",
    description: "Advanced multi-control panel that drives ListParams.",
    href: "/gallery/filter-panel",
    icon: FunnelIcon,
  },
  {
    category: "lists",
    title: "CSV export & import",
    description:
      "Download rows as CSV and import a file with a parsed preview.",
    href: "/gallery/export-import",
    icon: DownloadSimpleIcon,
  },
  {
    category: "lists",
    title: "Column controls",
    description: "Toggle column visibility and row density from a popover.",
    href: "/gallery/table-columns",
    icon: SlidersHorizontalIcon,
  },
  {
    category: "lists",
    title: "Saved views",
    description: "Save filter/sort presets by name and re-apply them.",
    href: "/gallery/saved-views",
    icon: BookmarkSimpleIcon,
  },
  {
    category: "lists",
    title: "Live / realtime",
    description: "Lists and metrics that auto-refresh on an interval.",
    href: "/gallery/realtime",
    icon: PulseIcon,
  },
  // Rich views
  {
    category: "rich",
    title: "Kanban board",
    description: "Status columns with drag-and-drop between them.",
    href: "/gallery/kanban",
    icon: KanbanIcon,
  },
  {
    category: "rich",
    title: "Tree view",
    description: "Expandable, indented hierarchy with lazy children.",
    href: "/gallery/tree",
    icon: TreeStructureIcon,
  },
  {
    category: "rich",
    title: "Calendar",
    description: "Records placed on a month grid with navigation.",
    href: "/gallery/calendar",
    icon: CalendarBlankIcon,
  },
  {
    category: "rich",
    title: "Timeline",
    description: "Reverse-chronological events grouped by day.",
    href: "/gallery/timeline",
    icon: ClockIcon,
  },
  // Detail & pages
  {
    category: "pages",
    title: "Tabbed record",
    description: "Record detail split across URL-synced tabs.",
    href: "/gallery/record-tabs",
    icon: CardsIcon,
  },
  {
    category: "pages",
    title: "Detail + related",
    description: "A parent record with child lists scoped to its id.",
    href: "/gallery/detail-related",
    icon: FileTextIcon,
  },
  {
    category: "pages",
    title: "Related records",
    description: "One record with its one-to-many children inline as tables.",
    href: "/gallery/related-records",
    icon: StackIcon,
  },
  {
    category: "pages",
    title: "Control / settings",
    description: "Grouped toggles and selects with a sticky save bar.",
    href: "/gallery/control-page",
    icon: SlidersHorizontalIcon,
  },
  {
    category: "pages",
    title: "Profile",
    description: "User profile with editable sections.",
    href: "/gallery/profile",
    icon: UserCircleIcon,
  },
  {
    category: "pages",
    title: "Empty state",
    description: "First-run / empty screens with a clear call to action.",
    href: "/gallery/empty-state",
    icon: TrayIcon,
  },
  {
    category: "pages",
    title: "Split layout",
    description: "Two-column content + aside that collapses responsively.",
    href: "/gallery/split-layout",
    icon: ColumnsIcon,
  },
  {
    category: "pages",
    title: "Roles & permissions",
    description: "Role-gated toolbar, row actions, and a RoleGate panel.",
    href: "/gallery/rbac",
    icon: ShieldCheckIcon,
  },
  {
    category: "pages",
    title: "Sign-in methods",
    description: "Social OAuth buttons and a passwordless magic-link form.",
    href: "/gallery/auth-methods",
    icon: FingerprintIcon,
  },
  // Display & feedback
  {
    category: "feedback",
    title: "Data display",
    description: "Tag list, metadata panel, user cell, and metric tiles.",
    href: "/gallery/data-display",
    icon: ChartBarIcon,
  },
  {
    category: "feedback",
    title: "Feedback & overlays",
    description: "Drawer / sheet, loading-empty-error kit, inline banners.",
    href: "/gallery/feedback",
    icon: BellIcon,
  },
  {
    category: "feedback",
    title: "Notification center",
    description: "Header bell with an unread badge and a popover feed.",
    href: "/gallery/notifications",
    icon: BellRingingIcon,
  },
  {
    category: "feedback",
    title: "Audit log",
    description: "Activity trail of who changed what, with field diffs.",
    href: "/gallery/audit-log",
    icon: ClockCounterClockwiseIcon,
  },
];

function ShapeCard({ shape }: { shape: Shape }) {
  const Icon = shape.icon;
  return (
    <Link
      to={shape.href}
      className="group flex items-start gap-3 border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
    >
      <span className="grid size-9 shrink-0 place-items-center bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          {shape.title}
          <CaretRightIcon
            size={14}
            className="-translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
          />
        </span>
        <span className="text-xs text-muted-foreground">
          {shape.description}
        </span>
      </div>
    </Link>
  );
}

function GalleryOverview() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Gallery
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A palette of admin UI shapes — forms, lists, pages, and rich views.
          Each card opens a self-contained, zero-config demo. The dashboards in
          the sidebar show these shapes <em>composed</em> into real business
          backends; this page is the catalogue you pick from. On port, keep what
          your product needs and run <code>trim-gallery</code> to delete the
          rest.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({ search: { tab: value as CategoryKey } })
        }
      >
        <TabsList className="w-fit">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.key} value={category.key}>
                <Icon />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category.key} value={category.key}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SHAPES.filter((shape) => shape.category === category.key).map(
                (shape) => (
                  <ShapeCard key={shape.href} shape={shape} />
                ),
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
