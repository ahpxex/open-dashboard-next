"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as RBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartSeries } from "./AreaChart";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_PRIMARY,
  CHART_TOOLTIP_STYLE,
  chartColor,
} from "./chart-colors";
import { LineChart } from "./LineChart";

/**
 * House rule: with this many categories or fewer, a bar chart reads cleaner as a
 * line chart, so `BarChart` renders a `LineChart` instead. Opt out per chart with
 * `forceBars`.
 */
export const BAR_TO_LINE_THRESHOLD = 8;

/** Whether a `BarChart` with `count` categories renders as a line (the ≤8 rule). */
export function barRendersAsLine(count: number, forceBars = false): boolean {
  return !forceBars && count <= BAR_TO_LINE_THRESHOLD;
}

export interface BarChartProps<T> {
  data: T[];
  xKey: Extract<keyof T, string>;
  bars: ChartSeries<T>[];
  height?: number;
  showLegend?: boolean;
  /**
   * Cap on each bar's width in px. With few categories Recharts otherwise
   * widens every bar to fill its band, which looks heavy — capping keeps bars
   * slim and evenly centred without adding more of them.
   */
  maxBarSize?: number;
  /**
   * Keep bars even with ≤ {@link BAR_TO_LINE_THRESHOLD} categories (opt out of the
   * line-chart rule) — e.g. a ranking where bar length is the point.
   */
  forceBars?: boolean;
}

/**
 * Themed, responsive bar chart with one bar series per entry. By house rule, with
 * ≤ {@link BAR_TO_LINE_THRESHOLD} categories it renders a {@link LineChart} instead
 * (few bars read better as a line); pass `forceBars` to keep bars.
 */
export function BarChart<T>({
  data,
  xKey,
  bars,
  height = 300,
  showLegend = false,
  maxBarSize = 44,
  forceBars = false,
}: BarChartProps<T>) {
  if (barRendersAsLine(data.length, forceBars)) {
    return (
      <LineChart
        data={data}
        xKey={xKey}
        series={bars}
        height={height}
        showLegend={showLegend}
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        <XAxis dataKey={xKey} stroke={CHART_AXIS_COLOR} fontSize={12} />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
        />
        {showLegend ? <Legend /> : null}
        {bars.map((s, index) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            maxBarSize={maxBarSize}
            fill={
              s.color ?? (bars.length === 1 ? CHART_PRIMARY : chartColor(index))
            }
          />
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
