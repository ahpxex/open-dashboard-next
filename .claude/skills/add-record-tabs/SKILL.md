---
name: add-record-tabs
description: Add a record detail with tabs (Overview / Activity / Settings …) where the active tab is synced to the URL. Use when one record has several distinct sub-views. Ships a copy-ready template.
---

# Add a tabbed record

A record header plus a controlled `Tabs` whose active tab is a URL search param,
so each sub-view is deep-linkable and survives the back button. The page is
**bundled** under `templates/` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-record-tabs/templates/record-tabs.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Define your tab enum in `tabSchema` (`z.enum([...]).default("overview")`) and
   each tab's content; the active tab reads from `Route.useSearch()` and is set
   with `Route.useNavigate({ search: { tab } })`.
3. Real record: load it in the route `loader` (`getOne(id)`, key
   `["<resource>","detail",id]`) and render the tabs from the loaded data; each
   tab can lazy-load its own data. Add a sidebar entry, or reach it from a detail
   page.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{badge,card,label,switch,tabs}`, `@/infra/ui` (`DescriptionList`),
`@tanstack/react-router`, `zod`, `@phosphor-icons/react`, the page-shell heading,
and theme tokens — all provided by the base (see the `scaffold-dashboard` skill).

## Invariants

- Active tab lives in the URL (shareable, back/forward works) — not local state.
- Detail query key `["<resource>","detail",id]`; tabs read from the loaded record.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — switching tabs updates
the URL and back/forward restores the tab.
