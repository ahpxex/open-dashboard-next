import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * A vertical audit / activity trail: who did what to which target, when, with an
 * optional field-level diff. Styled like the timeline (dots on a connecting
 * line). Purely presentational and generic over the `AuditEntry` shape — feed it
 * rows from an `audit_log` table (newest-first) or any activity source.
 */

/** Drives the dot colour. Defaults to "updated" when `tone` is omitted. */
export type AuditTone = "created" | "updated" | "deleted" | "status";

export interface AuditFieldChange {
  field: string;
  /** Previous value (omit on create). */
  from?: string;
  /** New value (omit on delete). */
  to?: string;
}

export interface AuditEntry {
  id: string;
  /** Display name of who performed the action. */
  actor: string;
  /** The readable verb phrase, e.g. "updated" / "changed status of". */
  action: string;
  /** What was acted on, e.g. "Order #1043". */
  target?: string;
  /** Pre-formatted timestamp label, e.g. "2m ago" or "Jun 12, 14:02". */
  time: string;
  /** Optional machine-readable ISO timestamp for the `<time dateTime>` attribute. */
  dateTime?: string;
  /** Optional per-field before/after changes (rendered as a diff list). */
  changes?: AuditFieldChange[];
  /** Dot colour category; defaults to "updated". */
  tone?: AuditTone;
}

const TONE_DOT: Record<AuditTone, string> = {
  created: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  updated: "bg-primary/10 text-primary",
  status: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  deleted: "bg-destructive/10 text-destructive",
};

function dotClass(tone: AuditTone = "updated"): string {
  return TONE_DOT[tone];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FieldDiff({ change }: { change: AuditFieldChange }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className="font-medium text-foreground">{change.field}</span>
      {change.from !== undefined ? (
        <span className="bg-destructive/10 px-1 text-destructive line-through">
          {change.from}
        </span>
      ) : null}
      {change.from !== undefined && change.to !== undefined ? (
        <span className="text-muted-foreground">→</span>
      ) : null}
      {change.to !== undefined ? (
        <span className="bg-emerald-500/10 px-1 text-emerald-700 dark:text-emerald-400">
          {change.to}
        </span>
      ) : null}
    </li>
  );
}

export function AuditTrail({
  entries,
  emptyMessage = "No activity yet.",
  className,
}: {
  entries: AuditEntry[];
  emptyMessage?: string;
  className?: string;
}) {
  if (entries.length === 0) {
    return (
      <p
        className={cn(
          "py-8 text-center text-xs text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol
      className={cn(
        "relative flex flex-col gap-5 border-l border-border pl-6",
        className,
      )}
    >
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className={cn(
              "absolute -left-[34px] grid size-7 place-items-center rounded-full ring-4 ring-background",
              dotClass(entry.tone),
            )}
          >
            <Avatar size="sm">
              <AvatarFallback className="text-[10px]">
                {initials(entry.actor)}
              </AvatarFallback>
            </Avatar>
          </span>

          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-foreground">
              <span className="font-medium">{entry.actor}</span>{" "}
              <span className="text-muted-foreground">{entry.action}</span>
              {entry.target ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {entry.target}
                  </span>
                </>
              ) : null}
            </p>
            <time
              dateTime={entry.dateTime}
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {entry.time}
            </time>
          </div>

          {entry.changes && entry.changes.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1 border-l border-border/60 pl-3 text-xs">
              {entry.changes.map((change, i) => (
                // Key by index: a field can legitimately change twice in one
                // entry, so the field name is not a stable key.
                <FieldDiff key={i} change={change} />
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
