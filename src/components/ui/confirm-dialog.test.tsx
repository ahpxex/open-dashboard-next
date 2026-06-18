import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmProvider, useConfirm } from "./confirm-dialog";

function Harness() {
  const confirm = useConfirm();
  const [result, setResult] = useState("none");
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({
            title: "Delete item?",
            description: "This cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          setResult(String(ok));
        }}
      >
        open
      </button>
      <span data-testid="result">{result}</span>
    </div>
  );
}

function renderHarness() {
  return render(
    <ConfirmProvider>
      <Harness />
    </ConfirmProvider>,
  );
}

describe("ConfirmDialog / useConfirm", () => {
  it("does not show the dialog until confirm() is called", () => {
    renderHarness();
    expect(screen.queryByText("Delete item?")).not.toBeInTheDocument();
  });

  it("resolves true when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByRole("button", { name: "open" }));
    expect(await screen.findByText("Delete item?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent("true"),
    );
  });

  it("resolves false when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByRole("button", { name: "open" }));
    await screen.findByText("Delete item?");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent("false"),
    );
  });

  it("throws when used outside a ConfirmProvider", () => {
    function Orphan() {
      useConfirm();
      return null;
    }
    // Silence the expected React error boundary log noise.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });
});
