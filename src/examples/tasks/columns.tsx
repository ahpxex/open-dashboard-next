import { PencilSimple, Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ChipColor, StatusChip } from "@/infra/ui";
import type { Task, TaskStatus } from "./types";

const statusColorMap: Record<TaskStatus, ChipColor> = {
  completed: "success",
  "in-progress": "warning",
  pending: "secondary",
  blocked: "danger",
};

export interface TasksTableContext {
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function createTasksColumns(
  context: TasksTableContext,
): ColumnDef<Task>[] {
  return [
    {
      accessorKey: "name",
      header: "Task",
      cell: (info) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">
            {info.getValue() as string}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {info.row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: (info) => {
        const assignee = info.getValue() as string;
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="sm" className="shrink-0">
              <AvatarImage src={info.row.original.avatar} alt={assignee} />
              <AvatarFallback>
                {assignee?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground truncate">{assignee}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => (
        <StatusChip
          status={info.getValue() as TaskStatus}
          colorMap={statusColorMap}
        />
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (info) => (
        <Badge variant="outline">{info.getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {(info.getValue() as string[]).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => context.onEdit(info.row.original)}
          >
            <PencilSimple size={16} />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => context.onDelete(info.row.original.id)}
          >
            <Trash size={16} />
            Delete
          </Button>
        </div>
      ),
    },
  ];
}
