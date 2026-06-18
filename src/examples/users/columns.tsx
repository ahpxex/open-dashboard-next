import type { ColumnDef } from "@tanstack/react-table";
import { type ChipColor, StatusChip } from "@/infra/ui";
import type { User, UserStatus } from "./types";

const statusColorMap: Record<UserStatus, ChipColor> = {
  active: "success",
  pending: "warning",
  inactive: "danger",
};

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => (
      <span className="font-medium truncate block">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400 truncate block">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <StatusChip
        status={info.getValue() as UserStatus}
        colorMap={statusColorMap}
      />
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: (info) => (
      <span className="text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
  },
];
