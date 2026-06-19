import { Progress } from "@/components/ui/progress";

/**
 * A metric tile: a label, the `value/total` ratio with its percentage, and a
 * progress bar. Percent is clamped to 0–100 and guards a zero total.
 */
export function ProgressTile({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((value / total) * 100)))
      : 0;

  return (
    <div className="flex flex-col gap-2 rounded-none border border-border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {percent}%
        </span>
      </div>
      <Progress value={percent} />
      <span className="text-xs text-muted-foreground tabular-nums">
        {value.toLocaleString()} / {total.toLocaleString()}
      </span>
    </div>
  );
}
