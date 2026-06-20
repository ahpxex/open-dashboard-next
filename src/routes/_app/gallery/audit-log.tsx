import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  type AuditEntry,
  type AuditTone,
  AuditTrail,
} from "@/components/data/AuditTrail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/gallery/audit-log")({
  component: AuditLogDemo,
});

// Realistic, newest-first audit history covering each action shape. `tone`
// drives the dot colour; `action` is the readable phrase.
const ENTRIES: AuditEntry[] = [
  {
    id: "a-1",
    actor: "Ava Chen",
    action: "changed status of",
    target: "Order #1043",
    time: "2m ago",
    tone: "status",
    changes: [{ field: "status", from: "processing", to: "shipped" }],
  },
  {
    id: "a-2",
    actor: "Marcus Lee",
    action: "updated",
    target: "Product “Aero Mug”",
    time: "18m ago",
    tone: "updated",
    changes: [
      { field: "price", from: "$24.00", to: "$19.00" },
      { field: "stock", from: "120", to: "96" },
    ],
  },
  {
    id: "a-3",
    actor: "System",
    action: "created",
    target: "Refund #R-88",
    time: "1h ago",
    tone: "created",
    changes: [
      { field: "amount", to: "$42.50" },
      { field: "reason", to: "damaged in transit" },
    ],
  },
  {
    id: "a-4",
    actor: "Priya Nair",
    action: "deleted",
    target: "Coupon “SPRING20”",
    time: "3h ago",
    tone: "deleted",
    changes: [{ field: "code", from: "SPRING20" }],
  },
  {
    id: "a-5",
    actor: "Ava Chen",
    action: "created",
    target: "Customer “Acme Co”",
    time: "Yesterday, 16:48",
    tone: "created",
  },
];

const ACTIONS: ("all" | AuditTone)[] = [
  "all",
  "created",
  "updated",
  "status",
  "deleted",
];

function AuditLogDemo() {
  const actors = useMemo(
    () => ["all", ...Array.from(new Set(ENTRIES.map((e) => e.actor)))],
    [],
  );
  const [actor, setActor] = useState<string>("all");
  const [action, setAction] = useState<string>("all");

  const filtered = ENTRIES.filter(
    (e) =>
      (actor === "all" || e.actor === actor) &&
      (action === "all" || e.tone === action),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Audit log
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A vertical activity trail: who did what to which record, when, with a
          field-level diff for updates. Filter by actor or action. Back it with
          an <code>audit_log</code> table and a <code>recordAudit()</code>{" "}
          helper called from your server fns; render it on any detail page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={actor} onValueChange={(v) => setActor(v ?? "all")}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            {actors.map((a) => (
              <SelectItem key={a} value={a}>
                {a === "all" ? "All actors" : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={(v) => setAction(v ?? "all")}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a === "all" ? "All actions" : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {ENTRIES.length}
        </span>
      </div>

      <div className="max-w-xl">
        <AuditTrail entries={filtered} emptyMessage="No matching activity." />
      </div>
    </div>
  );
}
