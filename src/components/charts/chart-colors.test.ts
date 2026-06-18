import { describe, expect, it } from "vitest";
import { CHART_COLORS, chartColor } from "./chart-colors";

describe("chartColor", () => {
  it("returns the palette colour at an index", () => {
    expect(chartColor(0)).toBe(CHART_COLORS[0]);
    expect(chartColor(2)).toBe(CHART_COLORS[2]);
  });

  it("wraps around the palette", () => {
    expect(chartColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
    expect(chartColor(CHART_COLORS.length + 2)).toBe(CHART_COLORS[2]);
  });

  it("uses CSS custom properties so charts re-theme with the .dark class", () => {
    for (const color of CHART_COLORS) {
      expect(color).toMatch(/^var\(--chart-\d\)$/);
    }
  });
});
