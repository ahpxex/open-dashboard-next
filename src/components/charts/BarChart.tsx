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

export interface BarChartProps<T> {
  data: T[];
  xKey: Extract<keyof T, string>;
  bars: ChartSeries<T>[];
  height?: number;
  showLegend?: boolean;
}

/** Themed, responsive bar chart with one bar series per entry. */
export function BarChart<T>({
  data,
  xKey,
  bars,
  height = 300,
  showLegend = false,
}: BarChartProps<T>) {
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
            fill={
              s.color ?? (bars.length === 1 ? CHART_PRIMARY : chartColor(index))
            }
          />
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
