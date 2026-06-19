---
name: add-timeline
description: Add a timeline / activity feed — chronological events on a vertical line, grouped by day. Use for audit logs, history, notifications, or any "what happened when" view. Ships a copy-ready template.
---

# Add a timeline / activity feed

A reverse-chronological feed grouped by day label, each event an icon dot on a
vertical line with an actor, an action, and a time. The page is **bundled** under
`templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-timeline/templates/timeline.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Replace the `GROUPS` data — map your events to `{ icon, actor, action, time, tone }`,
   grouped by day label.
3. Real resource: fetch events ordered by `createdAt desc` via a `Repository` and
   group by day; paginate with the `add-infinite-list` pattern for long histories.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@phosphor-icons/react` (the event icons + the `Icon` type), the page-shell heading,
and theme tokens (`border`/`background`/`foreground`/`muted`/`primary`, plus an
emerald success tone) — all provided by the base.

## Invariants

- Reverse-chronological; grouped by day with a labelled day header.
- The connecting line + dot are decorative; keep markup accessible (`ol`/`li` list
  semantics).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — events render in order
under their day groups.
