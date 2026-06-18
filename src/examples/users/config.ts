import type { TableConfig, TableMeta } from "@/infra/table";
import { usersColumns } from "./columns";
import type { User } from "./types";

export const usersMeta: TableMeta = {
  title: "Pagination Table",
  description: "Server-side pagination with TanStack Table and shadcn/ui.",
};

export const usersConfig: TableConfig<User> = {
  resource: "users",
  columns: usersColumns,
  filters: [
    {
      key: "status",
      label: "Filter by status",
      placeholder: "Filter by status",
      options: [
        { key: "active", label: "Active" },
        { key: "pending", label: "Pending" },
        { key: "inactive", label: "Inactive" },
      ],
    },
  ],
  pageSizeOptions: [5, 10, 15, 20, 25, 50],
  defaultPageSize: 10,
  enableSearch: true,
  searchPlaceholder: "Search all columns...",
  emptyMessage: "No users found",
};
