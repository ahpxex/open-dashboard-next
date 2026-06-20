import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/kanban")({
  component: KanbanDemo,
});

type ColumnId = "todo" | "doing" | "done";

type KanbanCard = {
  id: string;
  title: string;
  tag: string;
};

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const TAG_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Design: "secondary",
  Bug: "destructive",
  Feature: "default",
  Chore: "outline",
};

const INITIAL_BOARD: Record<ColumnId, KanbanCard[]> = {
  todo: [
    { id: "t-1", title: "Audit onboarding funnel", tag: "Feature" },
    { id: "t-2", title: "Fix avatar upload crop", tag: "Bug" },
    { id: "t-3", title: "Draft Q3 roadmap", tag: "Chore" },
  ],
  doing: [
    { id: "d-1", title: "Refine empty states", tag: "Design" },
    { id: "d-2", title: "Server-side pagination", tag: "Feature" },
  ],
  done: [
    { id: "n-1", title: "Dark mode tokens", tag: "Design" },
    { id: "n-2", title: "Seed demo dataset", tag: "Chore" },
  ],
};

function KanbanDemo() {
  const [board, setBoard] =
    useState<Record<ColumnId, KanbanCard[]>>(INITIAL_BOARD);
  const [dragging, setDragging] = useState<{
    from: ColumnId;
    cardId: string;
  } | null>(null);
  const [overColumn, setOverColumn] = useState<ColumnId | null>(null);

  function handleDrop(to: ColumnId) {
    setOverColumn(null);
    if (!dragging) return;
    const { from, cardId } = dragging;
    setDragging(null);
    if (from === to) return;

    const card = board[from].find((c) => c.id === cardId);
    if (!card) return;

    setBoard((prev) => ({
      ...prev,
      [from]: prev[from].filter((c) => c.id !== cardId),
      [to]: [...prev[to], card],
    }));

    const target = COLUMNS.find((c) => c.id === to);
    toast.success(`Moved "${card.title}" to ${target?.title}`);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Kanban board
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Drag cards between columns to update their status. Uses native HTML5
          drag-and-drop; the board lives in local state and reports each move
          with a toast.
        </p>
      </div>

      <div className="-mx-0.5 flex min-h-0 flex-1 gap-4 overflow-x-auto px-0.5 pb-2">
        {COLUMNS.map((column) => {
          const cards = board[column.id];
          const isOver = overColumn === column.id;
          return (
            <div
              key={column.id}
              className={cn(
                "flex min-h-0 min-w-72 flex-1 flex-col gap-3 rounded-none border border-border bg-muted/30 p-3 transition-colors",
                isOver && "border-primary bg-primary/5",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== column.id) setOverColumn(column.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn((prev) => (prev === column.id ? null : prev));
                }
              }}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex shrink-0 items-center justify-between px-1">
                <h2 className="font-heading text-sm font-medium">
                  {column.title}
                </h2>
                <Badge variant="outline">{cards.length}</Badge>
              </div>

              <div className="-mx-0.5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-0.5">
                {cards.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    Drop cards here
                  </p>
                ) : (
                  cards.map((card) => (
                    <Card
                      key={card.id}
                      size="sm"
                      draggable
                      onDragStart={() =>
                        setDragging({ from: column.id, cardId: card.id })
                      }
                      onDragEnd={() => {
                        setDragging(null);
                        setOverColumn(null);
                      }}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        dragging?.cardId === card.id && "opacity-50",
                      )}
                    >
                      <CardContent className="flex items-start gap-2">
                        <DotsSixVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-1 flex-col gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {card.title}
                          </p>
                          <Badge variant={TAG_VARIANT[card.tag] ?? "outline"}>
                            {card.tag}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
