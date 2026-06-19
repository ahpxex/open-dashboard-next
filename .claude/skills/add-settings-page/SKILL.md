---
name: add-settings-page
description: Add a settings / control page — grouped switches, selects, and inputs with a sticky "Save changes" bar that appears when the form is dirty. Also covers a profile/account page. Use for app/user settings.
---

# Add a settings / control page

**Canonical examples**
- `src/routes/_app/gallery/control-page.tsx` — grouped sections (Notifications /
  Privacy / Appearance) of `Switch`/`Select`/radio rows; a sticky bottom bar with
  Save/Discard appears only when dirty; Save → toast and clears dirty.
- `src/routes/_app/gallery/profile.tsx` — account page with avatar header, an
  editable info section, and a read-only `DescriptionList`.

## Add one

1. Copy the closest canonical file; define your setting groups + controls.
2. Track changes against the loaded values to compute `dirty`; on Save, persist via
   a server fn / `Repository` mutation and toast.
3. Add a sidebar entry (settings often live in `bottomMenuItems`).

## Invariants

- The save bar is gated on `dirty`; Discard restores loaded values.
- Controls are theme tokens (`Switch`/`Select`); report Save via `toast`.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — changing a control reveals
the save bar; Save/Discard behave.
