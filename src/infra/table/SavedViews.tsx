import {
  BookmarkSimpleIcon,
  CaretDownIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * The list state a view captures — a subset of `ListParams`. Kept generic so a
 * resource page can persist exactly its `{ search, filters, sort }` and re-apply
 * it verbatim.
 */
export interface ViewState {
  search: string;
  /**
   * Filter values, matching the `ListParams.filters` shape a resource sends to
   * its repository. A value is a single string for a plain select, or a
   * `string[]` for a multi-select / checkbox group (as `add-filter-panel`
   * produces) — so a saved view round-trips either kind without narrowing.
   */
  filters: Record<string, string | string[]>;
  sort: { id: string; desc: boolean } | null;
}

/** A named, persisted snapshot of {@link ViewState}. */
export interface SavedView {
  id: string;
  name: string;
  state: ViewState;
}

export interface SavedViewsProps {
  /** localStorage key — namespace per resource, e.g. `saved-views:products`. */
  storageKey: string;
  /** The list state to snapshot when the user saves a new view. */
  current: ViewState;
  /** Apply a saved view's state back to the page. */
  onApply: (state: ViewState) => void;
}

/** Read & parse saved views from localStorage; SSR/parse-safe (returns []). */
function readViews(storageKey: string): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedView[]) : [];
  } catch {
    return [];
  }
}

/** Persist saved views to localStorage; no-op on the server. */
function writeViews(storageKey: string, views: SavedView[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(views));
  } catch {
    // ignore quota / disabled-storage errors
  }
}

/**
 * Named filter/sort presets. "Save current view…" prompts a name and snapshots
 * `current` to `localStorage`; the dropdown lists saved views — picking one
 * calls `onApply` with its state, and each row has a delete control. SSR-guarded
 * (reads localStorage in an effect, after mount).
 */
export function SavedViews({ storageKey, current, onApply }: SavedViewsProps) {
  const [views, setViews] = useState<SavedView[]>([]);

  // Hydrate from localStorage after mount so SSR and the first client render
  // agree (empty), then fill in.
  useEffect(() => {
    setViews(readViews(storageKey));
  }, [storageKey]);

  function persist(next: SavedView[]) {
    setViews(next);
    writeViews(storageKey, next);
  }

  function handleSave() {
    if (typeof window === "undefined") return;
    const name = window.prompt("Name this view")?.trim();
    if (!name) return;
    const view: SavedView = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      // Snapshot, don't alias — later page changes must not mutate the saved view.
      state: structuredClone(current),
    };
    persist([...views, view]);
  }

  function handleDelete(id: string) {
    persist(views.filter((view) => view.id !== id));
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm">
              <BookmarkSimpleIcon data-icon="inline-start" />
              Views
              <CaretDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>Saved views</DropdownMenuLabel>
          {views.length === 0 ? (
            <DropdownMenuItem disabled>No saved views yet</DropdownMenuItem>
          ) : (
            views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => onApply(structuredClone(view.state))}
              >
                <span className="flex-1 truncate">{view.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Delete ${view.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(view.id);
                  }}
                >
                  <TrashIcon />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSave}>
            <PlusIcon />
            Save current view…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
