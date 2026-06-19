import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/filter-panel")({
  component: FilterPanelDemo,
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
    name: "Slate Monitor",
    category: "Accessories",
    status: "archived",
    price: 329,
  },
  {
    id: 10,
    name: "Halo Ring",
    category: "Wearables",
    status: "active",
    price: 179,
  },
  { id: 11, name: "Mesa Shelf", category: "Home", status: "draft", price: 139 },
  {
    id: 12,
    name: "Flux Charger",
    category: "Accessories",
    status: "active",
    price: 39,
  },
];

const CATEGORIES = ["Home", "Audio", "Wearables", "Accessories"];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Advanced filter panel — text search, a status select, and a category
 * checkbox group compose into a `{ search, filters }` object (the shape a
 * `ListParams` adapter expects). The dataset is filtered client-side and the
 * active params are echoed back so the mapping is explicit.
 */
function FilterPanelDemo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  const filters = useMemo(() => {
    const next: Record<string, string | string[]> = {};
    if (status !== "all") next.status = status;
    if (categories.length > 0) next.category = categories;
    return next;
  }, [status, categories]);

  const listParams = useMemo(
    () => ({ search: search.trim(), filters }),
    [search, filters],
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DATA.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (status !== "all" && item.status !== status) return false;
      if (categories.length > 0 && !categories.includes(item.category)) {
        return false;
      }
      return true;
    });
  }, [search, status, categories]);

  function toggleCategory(category: string) {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }

  function reset() {
    setSearch("");
    setStatus("all");
    setCategories([]);
  }

  const hasFilters =
    search.trim() !== "" || status !== "all" || categories.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Filter / advanced search panel
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Several controls compose into one filter object. Below, the local
          dataset is filtered and the resulting `ListParams` payload is shown so
          you can see it maps to {`{ search, filters }`}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-search">Search</Label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="filter-search"
                  className="pl-8"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value ?? "all")}
              >
                <SelectTrigger id="filter-status" className="w-full">
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

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs text-foreground">Category</legend>
              {CATEGORIES.map((category) => {
                const id = `cat-${category}`;
                return (
                  <Label key={category} htmlFor={id} className="gap-2">
                    <Checkbox
                      id={id}
                      checked={categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    {category}
                  </Label>
                );
              })}
            </fieldset>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasFilters}
              onClick={reset}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </span>
            {status !== "all" ? (
              <Badge variant="secondary" className="capitalize">
                status: {status}
              </Badge>
            ) : null}
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
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
                        No products match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active list params</CardTitle>
            </CardHeader>
            <CardContent>
              <pre
                className={cn(
                  "overflow-x-auto rounded-none bg-muted/50 p-3 text-xs leading-relaxed",
                )}
              >
                {JSON.stringify(listParams, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
