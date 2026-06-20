import {
  RowsIcon,
  SlidersHorizontalIcon,
  TableIcon,
} from "@phosphor-icons/react";
import type {
  Column,
  RowData,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Let a column carry a human label for the visibility toggle, independent of
// its (possibly non-string) header renderer. The type params mirror TanStack's
// `ColumnMeta<TData, TValue>` so the declaration merges; they're unused here.
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

/** Row density — "comfortable" (default padding) or "compact" (tighter rows). */
export type TableDensity = "comfortable" | "compact";

export interface ColumnControlsProps<T> {
  /** The TanStack Table instance whose column visibility this drives. */
  table: TanstackTable<T>;
  /** Current density value (controlled by the parent). */
  density: TableDensity;
  /** Called when the user flips density. */
  onDensityChange: (density: TableDensity) => void;
}

/** Prefer a column's `meta.label`, else its string header, else its id. */
function columnLabel<T>(column: Column<T, unknown>): string {
  const label = column.columnDef.meta?.label;
  if (label) return label;
  const header = column.columnDef.header;
  if (typeof header === "string") return header;
  return column.id;
}

/**
 * A "Columns" popover for a TanStack table: a checkbox per hideable column to
 * toggle visibility (driven by the table's `columnVisibility` state) plus a
 * comfortable/compact density toggle. Fully controlled — visibility lives in the
 * table instance, density in the parent.
 */
export function ColumnControls<T>({
  table,
  density,
  onDensityChange,
}: ColumnControlsProps<T>) {
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <SlidersHorizontalIcon data-icon="inline-start" />
            Columns
          </Button>
        }
      />
      <PopoverContent align="end" className="w-56">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Visible columns
            </span>
            <div className="flex flex-col gap-1.5">
              {hideableColumns.map((column) => {
                const id = `col-${column.id}`;
                return (
                  <Label key={column.id} htmlFor={id} className="gap-2">
                    <Checkbox
                      id={id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(checked === true)
                      }
                    />
                    {columnLabel(column)}
                  </Label>
                );
              })}
            </div>
          </div>

          <div className="-mx-1 h-px bg-border" />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">Density</span>
            <div className="grid grid-cols-2 gap-1.5">
              <DensityButton
                active={density === "comfortable"}
                onClick={() => onDensityChange("comfortable")}
                icon={<RowsIcon />}
                label="Comfortable"
              />
              <DensityButton
                active={density === "compact"}
                onClick={() => onDensityChange("compact")}
                icon={<TableIcon />}
                label="Compact"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DensityButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-1.5 border px-2 py-1.5 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
