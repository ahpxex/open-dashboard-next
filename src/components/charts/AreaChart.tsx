"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  Legend,
  AreaChart as RAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_TOOLTIP_STYLE,
  chartColor,
} from "./chart-colors";

export interface ChartSeries<T> {
  /** Data key for this series (must be a key of the row type). */
  key: Extract<keyof T, string>;
  /** Legend label (defaults to `key`). */
  label?: string;
  /** Override colour (defaults to the palette by index). */
  color?: string;
}

export interface AreaChartProps<T> {
  data: T[];
  xKey: Extract<keyof T, string>;
  series: ChartSeries<T>[];
  height?: number;
  showLegend?: boolean;
}

/** Themed, responsive area chart with one gradient-filled area per series. */
export function AreaChart<T>({
  data,
  xKey,
  series,
  height = 300,
  showLegend = true,
}: AreaChartProps<T>) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <defs>
          {series.map((s, index) => {
            const color = s.color ?? chartColor(index);
            return (
              <linearGradient
                key={s.key}
                id={`${gradientId}-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        <XAxis dataKey={xKey} stroke={CHART_AXIS_COLOR} fontSize={12} />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        {showLegend ? <Legend /> : null}
        {series.map((s, index) => {
          const color = s.color ?? chartColor(index);
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId}-${s.key})`}
            />
          );
        })}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
