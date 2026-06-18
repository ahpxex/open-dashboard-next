import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", cell: (i) => i.getValue() as string },
];

const data: Row[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
];

function Harness() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  return (
    <DataTable
      columns={columns}
      data={data}
      total={2}
      page={1}
      pageSize={10}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      getRowId={(r) => r.id}
      selectionActions={(ids) => <span>bulk:{ids.join(",")}</span>}
    />
  );
}

describe("DataTable row selection", () => {
  it("has no selection bar until a row is selected", () => {
    render(<Harness />);
    expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
  });

  it("selecting a row shows the count bar and passes ids to selectionActions", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getAllByLabelText("Select row")[0]);

    await waitFor(() =>
      expect(screen.getByText("1 selected")).toBeInTheDocument(),
    );
    expect(screen.getByText("bulk:a")).toBeInTheDocument();
  });

  it("select-all selects every row on the page", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText("Select all rows"));

    await waitFor(() =>
      expect(screen.getByText("2 selected")).toBeInTheDocument(),
    );
    expect(screen.getByText("bulk:a,b")).toBeInTheDocument();
  });
});
