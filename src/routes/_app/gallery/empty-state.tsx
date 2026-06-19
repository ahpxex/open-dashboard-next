import {
  FunnelXIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/empty-state")({
  component: EmptyStateDemo,
});

/**
 * Empty state. Gallery demo: a centered first-run placeholder (icon in a muted
 * circle, headline, description, primary + secondary CTAs). A toggle swaps in
 * the "filtered, no results" variant, which a search/filter view would show
 * once a query returns nothing.
 */
function EmptyStateDemo() {
  const [filtered, setFiltered] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Empty state
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A first-run placeholder for when a collection has no records yet, plus
          the "no matches" variant a filtered list shows instead.
        </p>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <Switch
          checked={filtered}
          onCheckedChange={(value) => setFiltered(value)}
        />
        Preview “filtered, no results” variant
      </label>

      <div className="flex min-h-80 flex-col items-center justify-center gap-4 border border-dashed border-border p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {filtered ? <FunnelXIcon size={28} /> : <PackageIcon size={28} />}
        </div>

        {filtered ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">No matching products</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                No products match your current search and filters. Try
                broadening your criteria or clearing the filters.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => setFiltered(false)}>
                <FunnelXIcon size={16} />
                Clear filters
              </Button>
              <Button
                variant="link"
                onClick={() => toast.success("Search adjusted")}
              >
                <MagnifyingGlassIcon size={16} />
                Edit search
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">No products yet</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Products you add will show up here. Create your first one to get
                started, or import an existing catalog.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => toast.success("Create product")}>
                <PlusIcon size={16} />
                Add product
              </Button>
              <Button
                variant="link"
                onClick={() => toast.success("Import started")}
              >
                Import from CSV
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
