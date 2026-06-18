"use client";

import { Plus } from "@phosphor-icons/react";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createTasksConfig, type Task, tasksMeta } from "@/examples/tasks";
import {
  PaginationTable,
  type PaginationTableRef,
  TablePage,
} from "@/infra/table";

export default function RichCellPage() {
  const tableRef = useRef<PaginationTableRef>(null);

  const handleEdit = useCallback((task: Task) => {
    console.log("Editing task:", task);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      console.log("Deleting task:", id);
      tableRef.current?.refresh();
    }
  }, []);

  const handleAddTask = useCallback(() => {
    console.log("Adding new task");
  }, []);

  const [totalCount, setTotalCount] = useState(0);
  const config = useMemo(
    () =>
      createTasksConfig({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleDelete, handleEdit],
  );

  return (
    <TablePage
      title={tasksMeta.title}
      description={`${tasksMeta.description ?? ""}${
        tasksMeta.description ? " " : ""
      }Total tasks: ${totalCount}`}
      actions={
        <Button onClick={handleAddTask}>
          <Plus size={18} weight="bold" />
          Add Task
        </Button>
      }
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <PaginationTable
          ref={tableRef}
          {...config}
          onTotalsChange={({ totalCount }) => setTotalCount(totalCount)}
        />
      </Suspense>
    </TablePage>
  );
}
