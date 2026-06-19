---
name: add-chart-page
description: Build a dashboard/analytics view from datasets using the reusable chart components (StatCard, ChartCard, AreaChart, BarChart, PieChart). Use for overview/metrics screens.
---

# Add a Chart page

Canonical example: `src/routes/_app/index.tsx`. Components in
`@/components/charts`.

## Components

- `StatCard` — KPI card: `{ label, value, icon?, trend?: {value, up}, progress?, sub? }`.
- `ChartCard` — titled panel wrapper: `{ title, action?, children }`.
- `AreaChart` / `LineChart` / `BarChart` / `PieChart` — generic over the row type;
  keys are type-checked against the data (`xKey`, `series`/`bars` keys,
  `nameKey`/`valueKey`). `LineChart` is a plain line (no fill); `AreaChart` is a
  line with a gradient fill.

## Pattern

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((s) => <StatCard key={s.label} {...s} />)}
</div>

<ChartCard title="Revenue & Users" action={<Badge variant="secondary">7 mo</Badge>}>
  <AreaChart
    data={data} xKey="name"
    series={[{ key: "revenue", color: CHART_PRIMARY }, { key: "users", color: CHART_SECONDARY }]}
  />
</ChartCard>
```

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
- Charts are generic over the row type — pass typed data; keys are checked.

## Verify

`bun run typecheck && bun run check && bun run test`, then load the page and
confirm the charts render (an SVG appears) and re-colour in dark mode.
