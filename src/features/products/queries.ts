import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { ProductInput, ProductListParams, ProductUpdate } from "./schema";
import {
  createProduct,
  deleteProduct,
  deleteProducts,
  getProduct,
  listProducts,
  updateProduct,
} from "./server";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function productsListQuery(params: ProductListParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts({ data: params }),
  });
}

export function productDetailQuery(id: string) {
  return queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct({ data: id }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toastSuccess("Product created");
    },
    onError: (err) => toastError(err, "Failed to create product"),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductUpdate) => updateProduct({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toastSuccess("Product updated");
    },
    onError: (err) => toastError(err, "Failed to update product"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toastSuccess("Product deleted");
    },
    onError: (err) => toastError(err, "Failed to delete product"),
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteProducts({ data: ids }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      const n = result.ids.length;
      toastSuccess(`${n} product${n === 1 ? "" : "s"} deleted`);
    },
    onError: (err) => toastError(err, "Failed to delete products"),
  });
}
