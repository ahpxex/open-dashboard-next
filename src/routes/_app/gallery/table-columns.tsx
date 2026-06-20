import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnControls,
  type TableDensity,
} from "@/infra/table/ColumnControls";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/table-columns")({
  component: TableColumnsDemo,
});

interface Person {
  id: number;
  name: string;
  email: string;
  team: string;
  role: string;
  status: "active" | "invited" | "suspended";
  location: string;
}

const DATA: Person[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    team: "Platform",
    role: "Owner",
    status: "active",
    location: "London",
  },
  {
    id: 2,
    name: "Grace Hopper",
    email: "grace@example.com",
    team: "Platform",
    role: "Admin",
    status: "active",
    location: "New York",
  },
  {
    id: 3,
    name: "Alan Turing",
    email: "alan@example.com",
    team: "Research",
    role: "Engineer",
    status: "invited",
    location: "Manchester",
  },
  {
    id: 4,
    name: "Katherine Johnson",
    email: "katherine@example.com",
    team: "Research",
    role: "Analyst",
    status: "active",
    location: "Hampton",
  },
  {
    id: 5,
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    team: "Flight",
    role: "Engineer",
    status: "suspended",
    location: "Boston",
  },
  {
    id: 6,
    name: "Edsger Dijkstra",
    email: "edsger@example.com",
    team: "Research",
    role: "Engineer",
    status: "invited",
    location: "Austin",
  },
];

// `meta.label` gives the visibility toggle a clean name for every column.
const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { label: "Name" },
    enableHiding: false,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  { accessorKey: "team", header: "Team", meta: { label: "Team" } },
  { accessorKey: "role", header: "Role", meta: { label: "Role" } },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status" },
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "outline"}
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    meta: { label: "Location" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.location}</span>
    ),
  },
];

/**
 * Column visibility + density controls on a TanStack table. The "Columns"
 * popover toggles each hideable column (via `columnVisibility` state) and flips
 * row density; density drives tighter cell padding. The `name` column opts out
 * of hiding with `enableHiding: false`.
 */
function TableColumnsDemo() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: false,
  });
  const [density, setDensity] = useState<TableDensity>("comfortable");

  const table = useReactTable({
    data: DATA,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const cellPadding = density === "compact" ? "py-1 text-xs" : "py-2.5 text-xs";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Column controls &amp; density
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A "Columns" popover toggles which columns are shown (TanStack Table{" "}
          <code>columnVisibility</code> state) and switches row density between
          comfortable and compact. The control is{" "}
          <code>@/infra/table/ColumnControls</code> — drop it beside any table.
        </p>
      </div>

      <div className="flex items-center justify-end">
        <ColumnControls
          table={table}
          density={density}
          onDensityChange={setDensity}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cellPadding)}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
