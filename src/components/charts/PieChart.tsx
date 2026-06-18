"use client";

import {
  Cell,
  Pie,
  ResponsiveContainer,
  PieChart as RPieChart,
  Tooltip,
} from "recharts";
import { CHART_TOOLTIP_STYLE, chartColor } from "./chart-colors";

export interface PieChartProps<T> {
  data: T[];
  /** Key holding each slice's label. */
  nameKey: Extract<keyof T, string>;
  /** Key holding each slice's numeric value. */
  valueKey: Extract<keyof T, string>;
  height?: number;
  /** Render a percentage label outside each slice. */
  showLabel?: boolean;
  /** Override slice colours (defaults to the palette). */
  colors?: string[];
}

/** Themed, responsive pie chart. Slice colours come from the chart palette. */
export function PieChart<T>({
  data,
  nameKey,
  valueKey,
  height = 280,
  showLabel = true,
  colors,
}: PieChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={
            showLabel
              ? (props) =>
                  `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              : undefined
          }
          outerRadius={95}
          dataKey={valueKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${String(entry[nameKey] ?? index)}`}
              fill={colors?.[index % colors.length] ?? chartColor(index)}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
      </RPieChart>
    </ResponsiveContainer>
  );
}
