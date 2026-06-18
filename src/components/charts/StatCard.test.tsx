import { UsersIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label, value, trend, and caption", () => {
    render(
      <StatCard
        label="Total Users"
        value="1,234"
        icon={UsersIcon}
        trend={{ value: "12%", up: true }}
        progress={65}
        sub="65% of monthly target"
      />,
    );
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByText("65% of monthly target")).toBeInTheDocument();
  });

  it("renders a progress bar when progress is provided", () => {
    const { container } = render(
      <StatCard label="Revenue" value="$10" progress={42} />,
    );
    expect(container.querySelector('[data-slot="progress"]')).toBeTruthy();
  });

  it("omits the trend pill and progress when not provided", () => {
    const { container } = render(<StatCard label="Sessions" value="9" />);
    expect(container.querySelector('[data-slot="progress"]')).toBeNull();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
  });
});
