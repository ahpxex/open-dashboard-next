/**
 * Chart palette built entirely from CSS custom properties, so charts re-theme
 * automatically with the `.dark` class — no JS theme lookup required.
 *
 * `--chart-1..5` are defined in `src/styles/app.css` for both colour schemes.
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/** Pick a palette colour by index, wrapping around the 5-colour palette. */
export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Always-prominent colour for a primary series (flips with the theme). */
export const CHART_PRIMARY = "var(--foreground)";
/** Muted colour for a secondary series. */
export const CHART_SECONDARY = "var(--muted-foreground)";

export const CHART_GRID_COLOR = "var(--border)";
export const CHART_AXIS_COLOR = "var(--muted-foreground)";

/** Inline style for a themed Recharts tooltip (matches the popover surface). */
export const CHART_TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--popover-foreground)",
  fontSize: 12,
} as const;
