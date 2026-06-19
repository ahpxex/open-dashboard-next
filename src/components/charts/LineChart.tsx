"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  LineChart as RLineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartSeries } from "./AreaChart";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_TOOLTIP_STYLE,
  chartColor,
} from "./chart-colors";

export interface LineChartProps<T> {
  data: T[];
  xKey: Extract<keyof T, string>;
  series: ChartSeries<T>[];
  height?: number;
  showLegend?: boolean;
}

/** Themed, responsive line chart — one line per series, no fill (vs `AreaChart`). */
export function LineChart<T>({
  data,
  xKey,
  series,
  height = 300,
  showLegend = true,
}: LineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        <XAxis dataKey={xKey} stroke={CHART_AXIS_COLOR} fontSize={12} />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        {showLegend ? <Legend /> : null}
        {series.map((s, index) => {
          const color = s.color ?? chartColor(index);
          return (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </RLineChart>
    </ResponsiveContainer>
  );
}
