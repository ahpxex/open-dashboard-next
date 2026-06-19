import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type {
  EmployeeInput,
  EmployeeListParams,
  EmployeeUpdate,
} from "./schema";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from "./server";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
};

export function employeesListQuery(params: EmployeeListParams) {
  return queryOptions({
    queryKey: employeeKeys.list(params),
    queryFn: () => listEmployees({ data: params }),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toastSuccess("Employee added");
    },
    onError: (err) => toastError(err, "Failed to add employee"),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeUpdate) => updateEmployee({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toastSuccess("Employee updated");
    },
    onError: (err) => toastError(err, "Failed to update employee"),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toastSuccess("Employee removed");
    },
    onError: (err) => toastError(err, "Failed to remove employee"),
  });
}
