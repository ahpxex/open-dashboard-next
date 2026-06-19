// Kanban board template — copy to `src/routes/_app/<name>.tsx`, then:
//   1. change the route path in createFileRoute to "/_app/<name>"
//   2. rename the component, set COLUMNS to your status enum + card shape
//   3. (real resource) group a Repository list by status into the board, and in
//      handleDrop call update(cardId, { status: to }) optimistically.
// Foundation APIs used: @/components/ui/{card,badge}, @/lib/toast, @/lib/utils (cn),
// @phosphor-icons/react. Page-shell heading + theme tokens only (no hardcoded colours).
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/board")({ component: KanbanBoard });

type ColumnId = "todo" | "doing" | "done";
type KanbanCard = { id: string; title: string; tag: string };

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
  ],
  doing: [{ id: "d-1", title: "Server-side pagination", tag: "Feature" }],
  done: [{ id: "n-1", title: "Dark mode tokens", tag: "Design" }],
};

function KanbanBoard() {
  const [board, setBoard] = useState(INITIAL_BOARD);
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
    // Real resource: call update(cardId, { status: to }) here (optimistic).
    toast.success(
      `Moved "${card.title}" to ${COLUMNS.find((c) => c.id === to)?.title}`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Board
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Drag cards between columns to change status.
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((column) => {
          const cards = board[column.id];
          const isOver = overColumn === column.id;
          return (
            <div
              key={column.id}
              className={cn(
                "flex min-w-72 flex-1 flex-col gap-3 border border-border bg-muted/30 p-3 transition-colors",
                isOver && "border-primary bg-primary/5",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== column.id) setOverColumn(column.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn((p) => (p === column.id ? null : p));
                }
              }}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="font-heading text-sm font-medium">
                  {column.title}
                </h2>
                <Badge variant="outline">{cards.length}</Badge>
              </div>
              <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
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
