---
name: add-feedback-states
description: Add feedback & overlay shapes — a side drawer (sheet), the loading/empty/error state kit, and inline banners. Use to give pages consistent loading/empty/error handling and slide-over panels.
---

# Add feedback & overlay states

**Canonical example**: `src/routes/_app/gallery/feedback.tsx`; the reusable kit is
`src/components/feedback/StateView.tsx` (`state: "loading" | "empty" | "error"` →
skeleton rows / centred empty + CTA / destructive `Alert` + retry; `"ready"` passes
children through). The drawer uses the `sheet` primitive; banners use `alert`.

## Add one

1. Wrap any data region in `<StateView state={...}>` so loading/empty/error are
   consistent across the app (drive `state` from your query's status).
2. Use a `Sheet` for slide-over detail/filters; `Alert` (default/destructive) for
   inline banners; `toast` for transient feedback.

## Invariants

- Every data view handles loading, empty, and error explicitly — `StateView` is the
  shared shape.
- Drawer/sheet content is self-contained and dismissible.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — toggle the three states
and open/close the drawer.
