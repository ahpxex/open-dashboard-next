import type { Icon } from "@phosphor-icons/react";
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";
const trendDownBadge = "border-transparent bg-destructive/15 text-destructive";

export interface StatCardProps {
  label: string;
  value: string;
  icon?: Icon;
  /** Optional trend pill, e.g. { value: "12%", up: true }. */
  trend?: { value: string; up: boolean };
  /** Optional progress bar (0–100). */
  progress?: number;
  /** Optional sub-caption under the value / progress. */
  sub?: string;
  className?: string;
}

/**
 * KPI summary card: icon + label, a big value, an optional trend pill, and an
 * optional progress bar + caption. The dashboard's top row is built from these.
 */
export function StatCard({
  label,
  value,
  icon: IconComponent,
  trend,
  progress,
  sub,
  className,
}: StatCardProps) {
  const TrendIcon = trend?.up ? TrendUpIcon : TrendDownIcon;
  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {IconComponent ? (
              <div className="grid size-9 place-items-center border border-border bg-muted text-foreground">
                <IconComponent size={20} weight="duotone" />
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          {trend ? (
            <Badge
              variant="outline"
              className={trend.up ? trendUpBadge : trendDownBadge}
            >
              <TrendIcon size={14} />
              {trend.value}
            </Badge>
          ) : null}
        </div>
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </p>
        {progress != null ? (
          <Progress value={progress} className={cn(sub ? "mt-1" : undefined)} />
        ) : null}
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}
