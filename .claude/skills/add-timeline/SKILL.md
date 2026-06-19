---
name: add-timeline
description: Add a timeline / activity feed — chronological events on a vertical line, grouped by day. Use for audit logs, history, notifications, or any "what happened when" view.
---

# Add a timeline / activity feed

**Canonical example**: `src/routes/_app/gallery/timeline.tsx` — reverse-chron
events grouped by day label, each with an icon dot on a vertical line, an actor,
an action, and a time.

## Add one

1. Copy the canonical file; map your events to `{ icon, actor, action, time }`,
   grouped by day.
2. For a real resource, fetch events ordered by `createdAt desc` and group by day;
   paginate with the `add-infinite-list` pattern for long histories.
3. Add a sidebar entry.

## Invariants

- Reverse-chronological; grouped by day with a sticky/labelled day header.
- The connecting line + dot are decorative; keep markup accessible (list semantics).

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — events render in order
under their day groups.
