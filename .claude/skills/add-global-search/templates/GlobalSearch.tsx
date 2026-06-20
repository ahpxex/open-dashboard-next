import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { useMemo, useState } from "react";
import { Kbd } from "@/components/ui/kbd";

/**
 * A single result row produced by a source. `href` is where selecting it
 * navigates; `id` keys the row.
 */
export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

/**
 * A searchable resource. Given the raw item list and a `toResult` mapper, the
 * component filters items by query (over the result's title + subtitle) and
 * groups the hits under `label`. Use `search` for a fully custom matcher
 * (async lists, server queries) — it wins over `items`/`toResult`.
 */
export interface SearchSource<T = unknown> {
  /** Group heading, e.g. "Customers". */
  label: string;
  /** Raw items to map + filter (ignored when `search` is provided). */
  items?: T[];
  /** Map one item to a result row (ignored when `search` is provided). */
  toResult?: (item: T) => SearchResult;
  /** Custom matcher; return the results for this query yourself. */
  search?: (query: string) => SearchResult[];
}

export interface GlobalSearchProps {
  sources: SearchSource[];
  /** Controlled open state. Omit for an always-open / embedded usage. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Render inline (no dialog/overlay) — used by the gallery demo. */
  inline?: boolean;
  placeholder?: string;
  /** Cap on results per group. Defaults to 6. */
  limitPerGroup?: number;
}

function defaultMatch(result: SearchResult, query: string): boolean {
  const haystack = `${result.title} ${result.subtitle ?? ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function groupResults(
  sources: SearchSource[],
  query: string,
  limitPerGroup: number,
): { label: string; results: SearchResult[] }[] {
  return sources
    .map((source) => {
      let results: SearchResult[];
      if (source.search) {
        results = source.search(query);
      } else {
        const mapped = (source.items ?? []).map((item) =>
          source.toResult ? source.toResult(item) : (item as SearchResult),
        );
        results = query ? mapped.filter((r) => defaultMatch(r, query)) : mapped;
      }
      return { label: source.label, results: results.slice(0, limitPerGroup) };
    })
    .filter((group) => group.results.length > 0);
}

/**
 * A ⌘K-style search across multiple resource sources. Keyboard-navigable
 * (cmdk), grouped by source, and navigates to the selected result's `href`.
 * Pass `inline` to embed it without the dialog chrome (e.g. an always-open
 * demo); otherwise it renders as a controlled `Command.Dialog`.
 */
export function GlobalSearch({
  sources,
  open,
  onOpenChange,
  inline = false,
  placeholder = "Search across everything…",
  limitPerGroup = 6,
}: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const groups = useMemo(
    () => groupResults(sources, query, limitPerGroup),
    [sources, query, limitPerGroup],
  );

  const onSelect = (href: string) => {
    onOpenChange?.(false);
    navigate({ to: href });
  };

  // `shouldFilter={false}` — we filter ourselves so groups + subtitles match.
  // The cmdk primitives (Input/List/Group/Item) are shared; only the *root*
  // differs: a `Command` (inline) or a `Command.Dialog` (overlay). Both supply
  // the cmdk context, so the inner markup is identical and never double-nested.
  const inner = (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3">
        <MagnifyingGlassIcon size={18} className="text-muted-foreground" />
        <Command.Input
          autoFocus
          value={query}
          onValueChange={setQuery}
          placeholder={placeholder}
          className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {!inline && <Kbd className="hidden sm:inline-flex">Esc</Kbd>}
      </div>

      <Command.List className="max-h-[400px] flex-1 overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
        <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
          No results found.
        </Command.Empty>

        {groups.map((group) => (
          <Command.Group
            key={group.label}
            heading={`${group.label} · ${group.results.length}`}
            className="mb-1"
          >
            {group.results.map((result) => (
              <Command.Item
                key={`${group.label}:${result.id}`}
                value={`${group.label} ${result.title} ${result.id}`}
                onSelect={() => onSelect(result.href)}
                className="flex cursor-pointer select-none flex-col items-start gap-0.5 px-2 py-2 text-sm outline-none transition-colors data-[selected=true]:bg-accent"
              >
                <span className="text-foreground">{result.title}</span>
                {result.subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </>
  );

  if (inline) {
    return (
      <Command
        shouldFilter={false}
        className="flex h-[420px] flex-col overflow-hidden border border-border bg-card"
      >
        {inner}
      </Command>
    );
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close search"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => onOpenChange?.(false)}
        />
      )}
      <Command.Dialog
        open={open ?? false}
        onOpenChange={onOpenChange}
        label="Global search"
        shouldFilter={false}
        className="fixed left-[50%] top-[20%] z-50 flex w-full max-w-xl translate-x-[-50%] flex-col overflow-hidden border border-border bg-card shadow-2xl animate-in fade-in-90 slide-in-from-bottom-10"
      >
        {inner}
      </Command.Dialog>
    </>
  );
}
