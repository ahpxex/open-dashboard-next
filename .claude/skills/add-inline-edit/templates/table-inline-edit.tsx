import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/table-inline-edit")({
  component: TableInlineEditDemo,
});

interface Member {
  id: number;
  name: string;
  role: string;
  status: "active" | "invited" | "suspended";
}

const INITIAL_ROWS: Member[] = [
  { id: 1, name: "Ada Lovelace", role: "Owner", status: "active" },
  { id: 2, name: "Grace Hopper", role: "Admin", status: "active" },
  { id: 3, name: "Alan Turing", role: "Engineer", status: "invited" },
  { id: 4, name: "Katherine Johnson", role: "Analyst", status: "active" },
  { id: 5, name: "Margaret Hamilton", role: "Engineer", status: "suspended" },
  { id: 6, name: "Edsger Dijkstra", role: "Engineer", status: "invited" },
];

const roleOptions = ["Owner", "Admin", "Engineer", "Analyst", "Viewer"];
const statusOptions: Member["status"][] = ["active", "invited", "suspended"];

const statusVariant: Record<
  Member["status"],
  "default" | "secondary" | "outline"
> = {
  active: "default",
  invited: "secondary",
  suspended: "outline",
};

type EditingCell = { id: number; field: "name" | "role" | "status" } | null;

/**
 * Inline / editable cells — click a cell to swap the static value for an input
 * or select. Blur or Enter commits the change to local state and toasts. Only
 * one cell is in edit mode at a time.
 */
function TableInlineEditDemo() {
  const [rows, setRows] = useState<Member[]>(INITIAL_ROWS);
  const [editing, setEditing] = useState<EditingCell>(null);
  const [draft, setDraft] = useState("");

  function startEdit(row: Member, field: "name" | "role" | "status") {
    setEditing({ id: row.id, field });
    setDraft(String(row[field]));
  }

  function commit(
    row: Member,
    field: "name" | "role" | "status",
    value: string,
  ) {
    setEditing(null);
    if (value === String(row[field])) return;
    if (field === "name" && value.trim() === "") {
      toast.error("Name can't be empty");
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)),
    );
    toast.success(`Updated ${field} for ${row.name}`);
  }

  const isEditing = (id: number, field: "name" | "role" | "status") =>
    editing?.id === id && editing.field === field;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Inline / editable cells
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Click a cell to edit it in place. Text commits on blur or Enter and
          reverts on Escape; selects commit on choice. Each commit updates local
          state and reports a toast.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {row.id}
                  </TableCell>

                  <TableCell>
                    {isEditing(row.id, "name") ? (
                      <Input
                        autoFocus
                        className="h-7"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commit(row, "name", draft)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commit(row, "name", draft);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="-mx-1 w-full rounded-none px-1 py-1 text-left hover:bg-muted/60"
                        onClick={() => startEdit(row, "name")}
                      >
                        {row.name}
                      </button>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing(row.id, "role") ? (
                      <Select
                        value={row.role}
                        onValueChange={(value) =>
                          commit(row, "role", value ?? row.role)
                        }
                        onOpenChange={(open) => {
                          if (!open && editing?.field === "role") {
                            setEditing(null);
                          }
                        }}
                        defaultOpen
                      >
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button
                        type="button"
                        className="-mx-1 w-full rounded-none px-1 py-1 text-left hover:bg-muted/60"
                        onClick={() => startEdit(row, "role")}
                      >
                        {row.role}
                      </button>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing(row.id, "status") ? (
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          commit(row, "status", value ?? row.status)
                        }
                        onOpenChange={(open) => {
                          if (!open && editing?.field === "status") {
                            setEditing(null);
                          }
                        }}
                        defaultOpen
                      >
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              <span className="capitalize">{option}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "-mx-1 rounded-none px-1 py-1 text-left hover:bg-muted/60",
                        )}
                        onClick={() => startEdit(row, "status")}
                      >
                        <Badge
                          variant={statusVariant[row.status]}
                          className="capitalize"
                        >
                          {row.status}
                        </Badge>
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
