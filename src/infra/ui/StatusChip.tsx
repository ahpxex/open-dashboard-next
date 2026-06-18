"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChipColor =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "secondary"
  | "default";

const colorClasses: Record<ChipColor, string> = {
  success:
    "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
  warning:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "border-transparent bg-destructive/15 text-destructive",
  primary: "border-transparent bg-primary/15 text-primary",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  default: "border-transparent bg-muted text-muted-foreground",
};

export interface StatusChipProps<T extends string> {
  status: T;
  colorMap: Record<T, ChipColor>;
  labelMap?: Record<T, string>;
  size?: "sm" | "md" | "lg";
  variant?:
    | "flat"
    | "bordered"
    | "solid"
    | "faded"
    | "shadow"
    | "light"
    | "dot";
  className?: string;
}

/**
 * Reusable status chip with configurable color mapping.
 *
 * @example
 * ```tsx
 * <StatusChip
 *   status="active"
 *   colorMap={{ active: "success", pending: "warning", inactive: "danger" }}
 *   labelMap={{ active: "Active", pending: "Pending", inactive: "Inactive" }}
 * />
 * ```
 */
export function StatusChip<T extends string>({
  status,
  colorMap,
  labelMap,
  className,
}: StatusChipProps<T>) {
  const color = colorMap[status] ?? "default";
  const label = labelMap?.[status] ?? formatStatus(status);

  return (
    <Badge variant="outline" className={cn(colorClasses[color], className)}>
      {label}
    </Badge>
  );
}

function formatStatus(status: string): string {
  return status
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
