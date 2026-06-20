import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SavedViews, type ViewState } from "@/infra/table/SavedViews";

export const Route = createFileRoute("/_app/gallery/saved-views")({
  component: SavedViewsDemo,
});

interface Product {
  id: number;
  name: string;
  category: string;
  status: "active" | "draft" | "archived";
  price: number;
}

const DATA: Product[] = [
  { id: 1, name: "Aurora Lamp", category: "Home", status: "active", price: 79 },
  {
    id: 2,
    name: "Nimbus Headphones",
    category: "Audio",
    status: "active",
    price: 199,
  },
  {
    id: 3,
    name: "Pulse Smartwatch",
    category: "Wearables",
    status: "draft",
    price: 249,
  },
  {
    id: 4,
    name: "Cedar Desk",
    category: "Home",
    status: "archived",
    price: 420,
  },
  {
    id: 5,
    name: "Echo Speaker",
    category: "Audio",
    status: "active",
    price: 129,
  },
  {
    id: 6,
    name: "Vela Keyboard",
    category: "Accessories",
    status: "active",
    price: 89,
  },
  {
    id: 7,
    name: "Orbit Mouse",
    category: "Accessories",
    status: "draft",
    price: 49,
  },
  {
    id: 8,
    name: "Tide Earbuds",
    category: "Audio",
    status: "active",
    price: 149,
  },
  {
    id: 9,
    name: "Halo Ring",
    category: "Wearables",
    status: "active",
    price: 179,
  },
  { id: 10, name: "Mesa Shelf", category: "Home", status: "draft", price: 139 },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "name-asc", label: "Name (A–Z)", id: "name", desc: false },
  { value: "name-desc", label: "Name (Z–A)", id: "name", desc: true },
  { value: "price-asc", label: "Price (low–high)", id: "price", desc: false },
  { value: "price-desc", label: "Price (high–low)", id: "price", desc: true },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function sortKey(sort: ViewState["sort"]): string {
  if (!sort) return "name-asc";
  return `${sort.id}-${sort.desc ? "desc" : "asc"}`;
}

/**
 * Named filter/sort presets. The page owns its `{ search, filters, sort }`
 * state; `SavedViews` snapshots it to localStorage under a per-resource key and
 * re-applies a chosen view via `onApply`. Save a view, change the filters, then
 * re-pick it to restore them.
 */
function SavedViewsDemo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<ViewState["sort"]>({
    id: "name",
    desc: false,
  });

  // The snapshot SavedViews persists and re-applies.
  const current = useMemo<ViewState>(() => {
    const filters: Record<string, string> = {};
    if (status !== "all") filters.status = status;
    return { search, filters, sort };
  }, [search, status, sort]);

  function applyView(state: ViewState) {
    setSearch(state.search);
    setStatus(state.filters.status ?? "all");
    setSort(state.sort);
  }

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = DATA.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (status !== "all" && item.status !== status) return false;
      return true;
    });
    if (sort) {
      const dir = sort.desc ? -1 : 1;
      filtered.sort((a, b) => {
        if (sort.id === "price") return (a.price - b.price) * dir;
        return a.name.localeCompare(b.name) * dir;
      });
    }
    return filtered;
  }, [search, status, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Saved views
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Save the current search, filters, and sort as a named view, then
          re-apply it later. Views persist to <code>localStorage</code> via{" "}
          <code>@/infra/table/SavedViews</code>. Try: filter to "Active", sort
          by price, save it — then change the filters and re-pick the view.
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sv-search">Search</Label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sv-search"
                className="w-56 pl-8"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sv-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value ?? "all")}
            >
              <SelectTrigger id="sv-status" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sv-sort">Sort</Label>
            <Select
              value={sortKey(sort)}
              onValueChange={(value) => {
                const option = sortOptions.find((o) => o.value === value);
                if (option) setSort({ id: option.id, desc: option.desc });
              }}
            >
              <SelectTrigger id="sv-sort" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SavedViews
          storageKey="gallery:saved-views"
          current={current}
          onApply={applyView}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No products match the current view.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "active" ? "default" : "outline"
                        }
                        className="capitalize"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {currency.format(item.price)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
