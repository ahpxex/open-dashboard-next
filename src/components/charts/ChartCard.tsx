import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: ReactNode;
  /** Optional right-aligned slot, e.g. a Badge or a range selector. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Titled card wrapper for charts. Keeps every chart panel visually consistent
 * (title + optional action on one row, chart body below).
 */
export function ChartCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {action ? <div data-slot="card-action">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
