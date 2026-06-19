import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/form-array")({
  component: FormArrayDemo,
});

interface LineItem {
  rid: number;
  description: string;
  qty: number;
  price: number;
}

const INITIAL_ROWS: LineItem[] = [
  { rid: 1, description: "Annual subscription", qty: 1, price: 1200 },
  { rid: 2, description: "Onboarding & setup", qty: 1, price: 500 },
  { rid: 3, description: "Extra seats", qty: 5, price: 90 },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Field-array form — a repeatable list of line-item rows kept in local state.
 * Rows use plain inputs (the count is dynamic), with an add/remove control and
 * a live computed total. Submit reports the payload via a toast.
 */
function FormArrayDemo() {
  const [rows, setRows] = useState<LineItem[]>(INITIAL_ROWS);
  const nextId = useRef(INITIAL_ROWS.length + 1);

  const total = rows.reduce(
    (sum, row) => sum + (row.qty || 0) * (row.price || 0),
    0,
  );

  function updateRow(rid: number, patch: Partial<LineItem>) {
    setRows((prev) =>
      prev.map((row) => (row.rid === rid ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    const rid = nextId.current++;
    setRows((prev) => [...prev, { rid, description: "", qty: 1, price: 0 }]);
  }

  function removeRow(rid: number) {
    setRows((prev) => prev.filter((row) => row.rid !== rid));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success(
      `Saved ${rows.length} items, total ${currency.format(total)}`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Field array (repeatable rows)
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A dynamic list of line items. Add or remove rows, edit each in place,
          and see the total recompute. Rows live in local state since the count
          is variable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice line items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-[1fr_5rem_7rem_8rem_2.5rem] items-center gap-3 text-xs font-medium text-muted-foreground">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span className="text-right">Line total</span>
              <span className="sr-only">Actions</span>
            </div>

            {rows.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No line items. Add one to get started.
              </p>
            ) : (
              rows.map((row) => (
                <div
                  key={row.rid}
                  className="grid grid-cols-[1fr_5rem_7rem_8rem_2.5rem] items-center gap-3"
                >
                  <Input
                    aria-label="Description"
                    placeholder="Item description"
                    value={row.description}
                    onChange={(e) =>
                      updateRow(row.rid, { description: e.target.value })
                    }
                  />
                  <Input
                    aria-label="Quantity"
                    type="number"
                    min={0}
                    value={String(row.qty)}
                    onChange={(e) =>
                      updateRow(row.rid, { qty: Number(e.target.value) || 0 })
                    }
                  />
                  <Input
                    aria-label="Unit price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={String(row.price)}
                    onChange={(e) =>
                      updateRow(row.rid, { price: Number(e.target.value) || 0 })
                    }
                  />
                  <span className="text-right text-sm tabular-nums">
                    {currency.format((row.qty || 0) * (row.price || 0))}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove line"
                    onClick={() => removeRow(row.rid)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              ))
            )}

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
              >
                <PlusIcon className="size-4" />
                Add line
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <Label className="text-sm text-muted-foreground">Total</Label>
            <span className="text-lg font-semibold tabular-nums">
              {currency.format(total)}
            </span>
          </div>
          <Button type="submit" disabled={rows.length === 0}>
            Save invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
