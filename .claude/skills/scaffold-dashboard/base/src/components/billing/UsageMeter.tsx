import { Progress } from "@/components/ui/progress";

/**
 * A usage meter: a label, the `used / limit` ratio, and a progress bar. Percent
 * is clamped to 0–100 and guards a zero limit. Presentational.
 */
export function UsageMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percent =
    limit > 0
      ? Math.min(100, Math.max(0, Math.round((used / limit) * 100)))
      : 0;
  const suffix = unit ? ` ${unit}` : "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {used.toLocaleString()} / {limit.toLocaleString()}
          {suffix}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
