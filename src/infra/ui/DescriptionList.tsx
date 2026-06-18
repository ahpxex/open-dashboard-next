import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** Span the full row (useful for long text like a description). */
  full?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** Number of columns on `sm`+ screens. Default 2. */
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnClass: Record<1 | 2 | 3, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/**
 * Label/value grid for record detail pages. Each item renders a muted label
 * above its value; `full` items span the whole row. The canonical building
 * block of the Detail/Show archetype.
 */
export function DescriptionList({
  items,
  columns = 2,
  className,
}: DescriptionListProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-4",
        columnClass[columns],
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={typeof item.label === "string" ? item.label : index}
          className={cn("flex flex-col gap-1", item.full && "sm:col-span-full")}
        >
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
