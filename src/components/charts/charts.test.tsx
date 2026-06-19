import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaChart } from "./AreaChart";
import { BAR_TO_LINE_THRESHOLD, BarChart, barRendersAsLine } from "./BarChart";
import { ChartCard } from "./ChartCard";
import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";

const series = [
  { name: "Jan", revenue: 4000, users: 240 },
  { name: "Feb", revenue: 3000, users: 198 },
];

const slices = [
  { name: "Direct", value: 4000 },
  { name: "Organic", value: 3000 },
];

describe("ChartCard", () => {
  it("renders the title, action, and body", () => {
    render(
      <ChartCard title="Revenue" action={<span>range</span>}>
        <div>body</div>
      </ChartCard>,
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("range")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});

describe("chart wrappers mount without throwing", () => {
  it("AreaChart mounts a responsive container", () => {
    const { container } = render(
      <AreaChart
        data={series}
        xKey="name"
        series={[{ key: "revenue" }, { key: "users" }]}
      />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeTruthy();
  });

  it("BarChart mounts a responsive container", () => {
    const { container } = render(
      <BarChart data={series} xKey="name" bars={[{ key: "revenue" }]} />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeTruthy();
  });

  it("PieChart mounts a responsive container", () => {
    const { container } = render(
      <PieChart data={slices} nameKey="name" valueKey="value" />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeTruthy();
  });

  it("LineChart mounts a responsive container", () => {
    const { container } = render(
      <LineChart data={series} xKey="name" series={[{ key: "revenue" }]} />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeTruthy();
  });
});

describe("BarChart → line house rule (≤ 8 categories render as a line)", () => {
  it("uses a line at or below the threshold, bars above it", () => {
    expect(barRendersAsLine(BAR_TO_LINE_THRESHOLD)).toBe(true);
    expect(barRendersAsLine(BAR_TO_LINE_THRESHOLD - 1)).toBe(true);
    expect(barRendersAsLine(1)).toBe(true);
    expect(barRendersAsLine(BAR_TO_LINE_THRESHOLD + 1)).toBe(false);
  });

  it("forceBars opts out of the rule", () => {
    expect(barRendersAsLine(2, true)).toBe(false);
    expect(barRendersAsLine(BAR_TO_LINE_THRESHOLD, true)).toBe(false);
  });
});
