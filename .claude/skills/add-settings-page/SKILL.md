---
name: add-settings-page
description: Add a settings / control page — grouped switches, selects, and inputs with a sticky "Save changes" bar that appears when the form is dirty. Also covers a profile/account page. Use for app/user settings. Ships a copy-ready template.
---

# Add a settings / control page

Two shapes ship here: a control page (grouped `Switch`/`Select`/radio rows with a
sticky save bar that appears only when dirty) and a profile/account page (avatar
header + editable info + read-only `DescriptionList`). The pages are **bundled**
under `templates/` — copy, don't paste.

## Add one

Pick the closer shape and copy it:

```bash
# Grouped settings with a dirty-gated save bar
cp .claude/skills/add-settings-page/templates/control-page.tsx src/routes/_app/<name>.tsx
# Profile / account page
cp .claude/skills/add-settings-page/templates/profile.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Define your setting groups + controls (control page) or info fields (profile);
   `dirty` is computed by diffing current state against the loaded/`saved` values.
3. Real use: seed state from a loaded record/server fn, and on Save persist via a
   server fn / `Repository` mutation and toast; Discard restores the loaded values.
   Add a sidebar entry — settings often live in `bottomMenuItems`.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

- **control-page**: `@/components/ui/{button,card,label,select,separator,switch}`,
  `@/lib/toast`.
- **profile**: `@/components/ui/{avatar,badge,button,card,input,label}`,
  `@/infra/ui` (`DescriptionList`), `@/lib/toast`.

Both also use `@tanstack/react-router`, `@phosphor-icons/react`, the page-shell
heading, and theme tokens — all provided by the base (see the `scaffold-dashboard`
skill).

## Invariants

- The save bar is gated on `dirty`; Discard restores loaded values.
- Controls are theme tokens (`Switch`/`Select`); report Save via `toast`.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — changing a control reveals
the save bar; Save/Discard behave.
