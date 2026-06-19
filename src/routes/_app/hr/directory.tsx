import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeFormDialog } from "@/features/employees/EmployeeFormDialog";
import {
  employeesListQuery,
  useDeleteEmployee,
} from "@/features/employees/queries";
import {
  allEmployeesParams,
  type Employee,
  type EmployeeStatus,
  employeeDepartments,
} from "@/features/employees/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/hr/directory")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(employeesListQuery(allEmployeesParams)),
  component: Directory,
});

const statusColorMap: Record<EmployeeStatus, ChipColor> = {
  active: "success",
  onleave: "warning",
  contractor: "secondary",
};

const statusLabelMap: Record<EmployeeStatus, string> = {
  active: "Active",
  onleave: "On leave",
  contractor: "Contractor",
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

type DialogState = { mode: "create" | "edit"; employee?: Employee } | null;

function Directory() {
  const query = useQuery(employeesListQuery(allEmployeesParams));
  const employees = query.data?.rows ?? [];
  const remove = useDeleteEmployee();
  const confirm = useConfirm();

  const [searchValue, setSearchValue] = useState("");
  const [department, setDepartment] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const filtered = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return employees.filter((employee) => {
      if (department && employee.department !== department) return false;
      if (
        term &&
        !`${employee.name} ${employee.title} ${employee.email}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [employees, searchValue, department]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone on the team, as a dense list.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          Add person
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search people…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-9 w-56"
        />
        <Select
          value={department}
          onValueChange={(value) =>
            setDepartment(value && value !== "all" ? value : "")
          }
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {employeeDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {titleCase(dept)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="divide-y divide-border border border-border">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No people found.
          </li>
        ) : (
          filtered.map((employee) => (
            <li key={employee.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                {employee.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{employee.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {employee.title} · {titleCase(employee.department)}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                {employee.email}
              </span>
              <StatusChip
                status={employee.status}
                colorMap={statusColorMap}
                labelMap={statusLabelMap}
              />
              <ActionMenu
                onEdit={() => setDialog({ mode: "edit", employee })}
                onDelete={async () => {
                  const ok = await confirm({
                    title: `Remove “${employee.name}”?`,
                    description: "This action cannot be undone.",
                    confirmLabel: "Remove",
                    destructive: true,
                  });
                  if (ok) remove.mutate(employee.id);
                }}
              />
            </li>
          ))
        )}
      </ul>

      <EmployeeFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        employee={dialog?.employee}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
