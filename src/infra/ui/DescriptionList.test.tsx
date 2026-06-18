import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./DescriptionList";

describe("DescriptionList", () => {
  it("renders each label/value pair", () => {
    render(
      <DescriptionList
        items={[
          { label: "Category", value: "Sports" },
          { label: "Price", value: "$10.00" },
        ]}
      />,
    );
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("spans full-width items across the row", () => {
    render(
      <DescriptionList
        items={[{ label: "Description", value: "long text", full: true }]}
      />,
    );
    const term = screen.getByText("Description").closest("div");
    expect(term?.className).toContain("col-span-full");
  });

  it("applies the requested column count", () => {
    const { container } = render(
      <DescriptionList columns={3} items={[{ label: "A", value: "1" }]} />,
    );
    expect(container.querySelector("dl")?.className).toContain(
      "sm:grid-cols-3",
    );
  });
});
