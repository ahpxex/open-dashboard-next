import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorMessage } from "@/lib/toast";
import {
  employeesListQuery,
  useCreateEmployee,
  useUpdateEmployee,
} from "./queries";
import {
  allEmployeesParams,
  type Employee,
  type EmployeeInput,
  employeeDepartments,
  employeeInputSchema,
  employeeStatuses,
} from "./schema";

const NO_MANAGER = "none";

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const departmentOptions = employeeDepartments.map((value) => ({
  value,
  label: titleCase(value),
}));

const statusOptions = employeeStatuses.map((value) => ({
  value,
  label: value === "onleave" ? "On leave" : titleCase(value),
}));

function toForm(employee?: Employee): EmployeeInput {
  if (!employee) {
    return {
      name: "",
      email: "",
      title: "",
      department: "engineering",
      managerId: NO_MANAGER,
      status: "active",
    };
  }
  return {
    name: employee.name,
    email: employee.email,
    title: employee.title,
    department: employee.department,
    managerId: employee.managerId || NO_MANAGER,
    status: employee.status,
  };
}

export function EmployeeFormDialog({
  open,
  mode,
  employee,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  employee?: Employee;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit employee" : "New employee"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this person's record."
              : "Add a person to the team."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <EmployeeForm
            key={employee?.id ?? "new"}
            mode={mode}
            employee={employee}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EmployeeForm({
  mode,
  employee,
  onDone,
}: {
  mode: "create" | "edit";
  employee?: Employee;
  onDone: () => void;
}) {
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const employeesQuery = useQuery(employeesListQuery(allEmployeesParams));
  const [serverError, setServerError] = useState<string | null>(null);

  const managerOptions = useMemo(() => {
    const others = (employeesQuery.data?.rows ?? [])
      .filter((candidate) => candidate.id !== employee?.id)
      .map((candidate) => ({
        value: candidate.id,
        label: `${candidate.name} — ${candidate.title}`,
      }));
    return [{ value: NO_MANAGER, label: "— None (top level) —" }, ...others];
  }, [employeesQuery.data, employee?.id]);

  const form = useForm({
    defaultValues: toForm(employee),
    validators: { onChange: employeeInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = employeeInputSchema.parse({
        ...value,
        managerId: value.managerId === NO_MANAGER ? "" : value.managerId,
      });
      try {
        if (mode === "edit" && employee) {
          await update.mutateAsync({ id: employee.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="name" label="Name" required />
      <TextField form={form} name="email" label="Email" type="email" required />
      <TextField form={form} name="title" label="Title" required />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="department"
          label="Department"
          options={departmentOptions}
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <SelectField
        form={form}
        name="managerId"
        label="Manager"
        options={managerOptions}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
