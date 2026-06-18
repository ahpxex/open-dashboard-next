import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { OrderInput, OrderListParams, OrderUpdate } from "./schema";
import {
  createOrders,
  deleteOrders,
  getOrder,
  listOrders,
  updateOrders,
} from "./server";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  list: (params: OrderListParams) => [...ordersKeys.lists(), params] as const,
  detail: (id: string) => [...ordersKeys.all, "detail", id] as const,
};

export function ordersListQuery(params: OrderListParams) {
  return queryOptions({
    queryKey: ordersKeys.list(params),
    queryFn: () => listOrders({ data: params }),
  });
}

export function orderDetailQuery(id: string) {
  return queryOptions({
    queryKey: ordersKeys.detail(id),
    queryFn: () => getOrder({ data: id }),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => createOrders({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      toastSuccess("Order created");
    },
    onError: (err) => toastError(err, "Failed to create order"),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderUpdate) => updateOrders({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      toastSuccess("Order updated");
    },
    onError: (err) => toastError(err, "Failed to update order"),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrders({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      toastSuccess("Order deleted");
    },
    onError: (err) => toastError(err, "Failed to delete order"),
  });
}
