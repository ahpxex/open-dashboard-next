---
name: add-audit-log
description: Add an activity / audit trail — a vertical timeline of who did what to which record, when, with an optional field-level before→after diff. Use for history tabs, compliance trails, "recent activity" panels. Ships a copy-ready component + demo.
---

# Add an audit log / activity trail

A vertical trail (actor avatar, action verb, target, relative time, and an
optional per-field "changed X from a to b" diff), styled like the timeline.
`AuditTrail` is **presentational** and generic over an `AuditEntry` shape; it
ships in `templates/AuditTrail.tsx` with a filtered demo in
`templates/audit-log.tsx`.

## Render it

```tsx
import { AuditTrail, type AuditEntry } from "@/components/data/AuditTrail";

<AuditTrail
  entries={[
    {
      id: "1",
      actor: "Ava Chen",
      action: "changed status of",
      target: "Order #1043",
      time: "2m ago",
      tone: "status",
      changes: [{ field: "status", from: "processing", to: "shipped" }],
    },
  ]}
/>;
```

Feed it rows newest-first. `tone` (`created`/`updated`/`deleted`/`status`) drives
the dot colour; `changes` is optional and renders the before→after diff (omit
`from` on create, `to` on delete).

## Record entries on mutations

1. Add an `audit_log` Drizzle table: `{ id, actor, action, targetType, targetId,
   changes (jsonb), createdAt }`.
2. Add a `recordAudit(entry)` helper (a server-side insert) and call it inside
   each `create*` / `update*` / `delete*` server fn, after `requireUser()` —
   capture the actor from the session and diff the changed fields for `changes`.
3. On a detail page, add an "Activity" tab/panel: a `*ListQuery` ordered by
   `createdAt desc`, mapped to `AuditEntry[]` (format `createdAt` to the `time`
   label), rendered with `<AuditTrail>`. Long histories: paginate with the
   **add-infinite-list** pattern.

(Only open the templates if you need to customise them — copying costs no context.)

## Foundation it assumes

`@/components/ui/avatar`, `@/lib/utils` (`cn`), the page-shell heading, and theme
tokens (`border`/`background`/`foreground`/`muted`, plus emerald/amber/destructive
accent tones) — all provided by the base.

## Invariants

- Reverse-chronological (newest first); the connecting line + dot are decorative
  but markup stays list-semantic (`ol`/`li`).
- Audit rows are append-only history — write them in the same server fn as the
  mutation; never edit or backfill them client-side.
- `tone` drives colour; the diff is value-formatted strings (no raw objects).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — entries render newest
first with correct dot tones; the update entry shows its before→after diff; the
actor/action filters narrow the list.
