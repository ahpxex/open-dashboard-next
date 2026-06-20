---
name: add-notifications
description: Add an in-app notification center — a header bell with an unread-count badge that opens a popover feed (icon + title + body + relative time + read/unread), with mark-one and mark-all-read. Use for activity alerts, mentions, system events. Ships a copy-ready component + demo.
---

# Add a notification center

A bell button with an unread-count badge that opens a popover feed of
notifications. The component is **presentational + controlled** — you pass it a
`notifications` array and read callbacks — plus a `useNotifications` local-store
hook for standalone use. Both ship in `templates/NotificationCenter.tsx`; the
wired demo is `templates/notifications.tsx`.

## Drop the bell into the header

```tsx
import { NotificationCenter, useNotifications } from "@/components/NotificationCenter";

const { notifications, markRead, markAllRead } = useNotifications(initial);

<NotificationCenter
  notifications={notifications}
  onMarkRead={markRead}
  onMarkAllRead={markAllRead}
/>
```

Place it in the app header beside the theme/account controls. `useNotifications`
also returns `push(newNotification)` and `unreadCount` for local prototypes.

## Back it with a real resource

Replace the local store with a query + a mutation — `NotificationCenter` itself
doesn't change:

1. Add a `notifications` resource (copy the `products` vertical): a Drizzle table
   `{ id, userId, kind, title, body, createdAt, readAt }`, scoped to the signed-in
   user in `server.ts` via `requireUser()`.
2. `notificationsListQuery()` → feed `data` into `notifications`. Make it live by
   adding `refetchInterval` (see the **add-realtime** skill) so new ones arrive.
3. `useMarkRead()` / `useMarkAllRead()` mutations call server fns that set
   `readAt`, then invalidate the resource's keys. Wire them to `onMarkRead` /
   `onMarkAllRead`. The unread count is `rows.filter(n => !n.readAt).length`.

(Only open the templates if you need to customise them — copying costs no context.)

## Foundation it assumes

`@/components/ui/{popover,button}`, `@phosphor-icons/react`, `@/lib/utils` (`cn`),
the page-shell heading, and theme tokens (`primary`/`muted`/`border`, plus emerald
/ amber accent tones) — all provided by the base.

## Invariants

- Controlled: the feed renders the passed array; read state lives with the owner
  (a store or the server), never duplicated inside the component.
- The unread badge counts `!read` items and caps at `badgeCap` (e.g. `9+`).
- Popover + theme tokens only; the feed scrolls inside a fixed max height.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — open the bell, mark one
read (its dot clears, badge drops), mark all read (badge disappears).
