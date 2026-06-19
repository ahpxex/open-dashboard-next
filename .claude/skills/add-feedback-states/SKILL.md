---
name: add-feedback-states
description: Add feedback & overlay shapes — a side drawer (sheet), the loading/empty/error state kit, and inline banners. Use to give pages consistent loading/empty/error handling and slide-over panels. Ships a copy-ready template.
---

# Add feedback & overlay states

A consistent kit for async outcomes and overlays: `StateView`
(`state: "loading" | "empty" | "error"` → skeleton rows / centred empty + CTA /
destructive `Alert` + retry; `"ready"` passes children through), a side drawer
(`Sheet`), and inline banners (`Alert`). The component and a showcase page are
**bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-feedback-states/templates/StateView.tsx src/components/feedback/StateView.tsx
# Optional: a gallery page showcasing StateView + Sheet + Alert + toast
cp .claude/skills/add-feedback-states/templates/feedback.tsx src/routes/_app/<name>.tsx
```

Then:
1. Wrap any data region in `<StateView state={...}>` so loading/empty/error are
   consistent across the app — drive `state` from your query's status, and pass
   `title`/`description`/`action` for the empty and error branches.
2. Use a `Sheet` for slide-over detail/filters; `Alert` (default/destructive) for
   inline banners; `toast` for transient feedback.
3. If you copied the showcase page, set its `createFileRoute("/_app/<name>")` path
   to match the file path.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

- **StateView**: `@/components/ui/{alert,button,skeleton}`,
  `@phosphor-icons/react`.
- **showcase page**: also `@/components/ui/{card,separator,sheet}`, `@/lib/toast`,
  `@tanstack/react-router`, the page-shell heading.

Theme tokens throughout — all provided by the base (see the `scaffold-dashboard`
skill).

## Invariants

- Every data view handles loading, empty, and error explicitly — `StateView` is the
  shared shape.
- Drawer/sheet content is self-contained and dismissible.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — toggle the three states
and open/close the drawer.
