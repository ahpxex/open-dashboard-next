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
- `AreaChart` / `BarChart` / `PieChart` — generic over the row type; keys are
  type-checked against the data (`xKey`, `series`/`bars` keys, `nameKey`/`valueKey`).

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

- Charts are **themed entirely via CSS variables** (`--chart-1..5`, `--border`,
  `--popover`) and re-theme with the `.dark` class — never hardcode colours or
  read the JS theme. Use `CHART_PRIMARY`/`CHART_SECONDARY` for prominent series,
  `chartColor(i)` for categorical palettes.
- Charts are generic over the row type — pass typed data; keys are checked.

## Verify

`bun run typecheck && bun run check && bun run test`, then load the page and
confirm the charts render (an SVG appears) and re-colour in dark mode.
