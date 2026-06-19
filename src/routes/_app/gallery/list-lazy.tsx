import { CaretRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/gallery/list-lazy")({
  component: ListLazyDemo,
});

const SECTION_NAMES = [
  "Platform",
  "Growth",
  "Billing",
  "Data",
  "Security",
  "Mobile",
  "Support",
  "Design",
];
const STATUS = ["open", "in review", "merged"] as const;
const STATUS_VARIANT = {
  open: "default",
  "in review": "secondary",
  merged: "outline",
} as const;

type Item = {
  id: string;
  title: string;
  meta: string;
  status: (typeof STATUS)[number];
};

type SectionState = {
  expanded: boolean;
  loading: boolean;
  items: Item[] | null;
};

const SECTIONS = SECTION_NAMES.map((name, i) => ({
  name,
  count: 3 + (i % 4),
}));

function buildItems(sectionIndex: number, name: string, count: number): Item[] {
  return Array.from({ length: count }, (_, j) => ({
    id: `${sectionIndex}-${j}`,
    title: `${name} task ${j + 1}`,
    meta: `PR #${sectionIndex * 100 + j + 1} · ${(j + 1) * 4} changed files`,
    status: STATUS[(sectionIndex + j) % STATUS.length],
  }));
}

/**
 * Lazy-loaded list — eight collapsible sections whose items are only
 * "fetched" when the section is first expanded. Expanding flips a per-section
 * loading flag, shows skeletons, then populates items after a short delay.
 * Gallery demo: deterministic data, simulated async, no server.
 */
function ListLazyDemo() {
  const [state, setState] = useState<SectionState[]>(() =>
    SECTIONS.map(() => ({ expanded: false, loading: false, items: null })),
  );

  const toggle = useCallback((index: number) => {
    setState((prev) => {
      const current = prev[index];
      const next = [...prev];

      // Collapse if already open.
      if (current.expanded) {
        next[index] = { ...current, expanded: false };
        return next;
      }
      // Open with items already loaded — just show them.
      if (current.items) {
        next[index] = { ...current, expanded: true };
        return next;
      }
      // Open for the first time — mark loading and lazy-load the items.
      next[index] = { ...current, expanded: true, loading: true };
      const section = SECTIONS[index];
      const items = buildItems(index, section.name, section.count);
      setTimeout(() => {
        setState((cur) => {
          const updated = [...cur];
          updated[index] = { ...updated[index], loading: false, items };
          return updated;
        });
      }, 600);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Lazy-loaded list
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Collapsible sections that defer loading until expanded. The first time
          a section opens it shows skeleton rows, then resolves its items.
          Gallery demo with simulated async — deterministic, no server.
        </p>
      </div>

      <div className="max-w-2xl divide-y divide-border border border-border">
        {SECTIONS.map((section, i) => {
          const s = state[i];
          return (
            <div key={section.name}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={s.expanded}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <CaretRightIcon
                  size={14}
                  className={`shrink-0 text-muted-foreground transition-transform ${
                    s.expanded ? "rotate-90" : ""
                  }`}
                />
                <span className="flex-1 font-medium text-sm">
                  {section.name}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {section.count} items
                </span>
              </button>

              {s.expanded && (
                <div className="divide-y divide-border border-border border-t bg-muted/20">
                  {s.loading &&
                    Array.from({ length: section.count }, (_, k) => (
                      <div
                        key={k}
                        className="flex items-center gap-3 px-3 py-2.5 pl-9"
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-40" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}

                  {!s.loading &&
                    s.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2.5 pl-9 transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm leading-tight">
                            {item.title}
                          </p>
                          <p className="truncate text-muted-foreground text-xs leading-tight">
                            {item.meta}
                          </p>
                        </div>
                        <Badge variant={STATUS_VARIANT[item.status]}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
