---
name: add-chart-page
description: Build a dashboard/analytics view from datasets using the reusable chart components (StatCard, ChartCard, AreaChart, BarChart, PieChart). Use for overview/metrics screens. Ships a copy-ready template.
---

# Add a Chart page

A dashboard/overview view: a row of `StatCard` KPIs, `ChartCard`-wrapped charts
derived from resource data, plus a recent-activity list and a quick-actions card.
The full page is **bundled** at `templates/index.tsx` — copy, don't paste.

## Add one

```bash
# overview / home dashboard:
cp .claude/skills/add-chart-page/templates/index.tsx src/routes/_app/index.tsx
# or a named analytics page:
cp .claude/skills/add-chart-page/templates/index.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the route — `createFileRoute("/_app/")` for the home dashboard, or
   `createFileRoute("/_app/<name>")` for a named page (and rename the component).
2. Swap the demo data sources: the template `loader` + `useQuery` pull from the
   `users` / `tasks` / `redemption-codes` resources and the `useMemo` derives
   stats + chart series from those rows. Point them at your resources and
   recompute the `StatCard[]`, the bar/pie data, and the activity list.
3. Adjust the chart mix to your data (see Invariants for bar-vs-line and the
   chart-type guidance). Fix the heading, quick-action links, and the welcome
   line (`Route.useRouteContext().user`).

The template wires the real `users` / `tasks` / `redemption-codes` resources. A
chart page over your own data needs matching `features/<name>/` resources whose
list queries it can read — `add-crud-resource` / `create-resource` scaffolds them.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/charts` (`StatCard` + `StatCardProps`, `ChartCard`, `BarChart`,
`PieChart`, and also `AreaChart`/`LineChart`; plus `CHART_PRIMARY`/
`CHART_SECONDARY`/`chartColor`), `@/components/ui/{badge,button,card}`,
`@tanstack/react-query` (`useQuery`), `@tanstack/react-router` (`Link`,
`ensureQueryData` in the loader), `@phosphor-icons/react`, the page-shell heading,
and theme tokens (`text-muted-foreground`, `border-border`, `bg-muted`) — all
provided by the base. Plus the resources it charts (`features/<name>/` list
queries).

## Invariants

- **Few bars → line (house rule).** With ≤ `BAR_TO_LINE_THRESHOLD` (8) categories,
  `BarChart` renders a `LineChart` automatically — a handful of points reads
  cleaner as a line. Pass `forceBars` only when bar length is the point (e.g. a
  ranking). Reach for `BarChart` for many discrete categories, `AreaChart`/
  `LineChart` for trends.
- Charts are **themed entirely via CSS variables** (`--chart-1..5`, `--border`,
  `--popover`) and re-theme with the `.dark` class — never hardcode colours or
  read the JS theme. Use `CHART_PRIMARY`/`CHART_SECONDARY` for prominent series,
  `chartColor(i)` for categorical palettes.
- Charts are generic over the row type — pass typed data; keys (`xKey`,
  `series`/`bars` keys, `nameKey`/`valueKey`) are checked against the data.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — load the page and
confirm the charts render (an SVG appears) and re-colour in dark mode.
