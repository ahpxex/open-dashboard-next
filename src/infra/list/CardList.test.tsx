import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardList } from "./CardList";

interface Item {
  id: string;
  name: string;
}

const baseProps = {
  getKey: (i: Item) => i.id,
  renderCard: (i: Item) => <div>{i.name}</div>,
  page: 1,
  pageSize: 10,
  onPageChange: () => {},
  onPageSizeChange: () => {},
};

describe("CardList", () => {
  it("renders a card per item via renderCard", () => {
    render(
      <CardList<Item>
        {...baseProps}
        data={[
          { id: "1", name: "Alpha" },
          { id: "2", name: "Beta" },
        ]}
        total={2}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows the empty message when there are no items", () => {
    render(
      <CardList<Item>
        {...baseProps}
        data={[]}
        total={0}
        emptyMessage="No posts found."
      />,
    );
    expect(screen.getByText("No posts found.")).toBeInTheDocument();
  });

  it("shows skeleton placeholders while loading with no data", () => {
    const { container } = render(
      <CardList<Item>
        {...baseProps}
        data={[]}
        total={0}
        isLoading
        skeletonCount={4}
      />,
    );
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(4);
  });

  it("renders the search box and toolbar actions", () => {
    render(
      <CardList<Item>
        {...baseProps}
        data={[]}
        total={0}
        searchPlaceholder="Search posts…"
        toolbarActions={<button type="button">Add post</button>}
      />,
    );
    expect(screen.getByPlaceholderText("Search posts…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add post" }),
    ).toBeInTheDocument();
  });
});
