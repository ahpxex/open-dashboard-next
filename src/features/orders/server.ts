import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { orders } from "@/db/schema";
import { drizzleRepository } from "@/infra/data";
import { requireUser } from "@/lib/require-user";
import {
  type OrderListParams,
  ordersInputSchema,
  ordersListParamsSchema,
  ordersUpdateSchema,
} from "./schema";

export const ordersRepository = drizzleRepository(orders, {
  searchColumns: [orders.name],
  sortColumns: {
    name: orders.name,
    status: orders.status,
    createdAt: orders.createdAt,
  },
  filterColumns: { status: orders.status },
  defaultSort: { column: orders.createdAt, dir: "desc" },
  updatedAtKey: "updatedAt",
});

function toListParams(data: OrderListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.status ? { status: data.status } : undefined,
  };
}

export const listOrders = createServerFn({ method: "GET" })
  .validator((data: OrderListParams) => ordersListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return ordersRepository.list(toListParams(data));
  });

export const getOrder = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return ordersRepository.getOne(id);
  });

export const createOrders = createServerFn({ method: "POST" })
  .validator((data: unknown) => ordersInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return ordersRepository.create(data);
  });

export const updateOrders = createServerFn({ method: "POST" })
  .validator((data: unknown) => ordersUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return ordersRepository.update(id, values);
  });

export const deleteOrders = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await ordersRepository.remove(id);
    return { id };
  });
