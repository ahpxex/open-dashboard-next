import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

type Board = Record<ColumnId, KanbanCard[]>;

function KanbanDemo() {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [originColumn, setOriginColumn] = useState<ColumnId | null>(null);

  const sensors = useSensors(
    // A small activation distance lets a plain click still register as a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** Which column holds `id` — `id` may be a card id or a column (droppable) id. */
  function findColumn(id: string): ColumnId | undefined {
    if (id in board) return id as ColumnId;
    return (Object.keys(board) as ColumnId[]).find((col) =>
      board[col].some((c) => c.id === id),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const col = findColumn(id);
    if (!col) return;
    setOriginColumn(col);
    setActiveCard(board[col].find((c) => c.id === id) ?? null);
  }

  // Move a card across columns live as it's dragged over a new one, so the
  // insertion gap (and the destination) update under the cursor.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const from = findColumn(String(active.id));
    const to = findColumn(String(over.id));
    if (!from || !to || from === to) return;

    setBoard((prev) => {
      const fromCards = prev[from];
      const toCards = prev[to];
      const card = fromCards.find((c) => c.id === active.id);
      if (!card) return prev;

      // Insert at the hovered card's position, or append when over the column.
      const overIndex = toCards.findIndex((c) => c.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : toCards.length;

      return {
        ...prev,
        [from]: fromCards.filter((c) => c.id !== card.id),
        [to]: [...toCards.slice(0, insertAt), card, ...toCards.slice(insertAt)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const card = activeCard;
    const start = originColumn;
    setActiveCard(null);
    setOriginColumn(null);
    if (!over || !card || !start) return;

    const to = findColumn(String(over.id));
    if (!to) return;

    // Reorder within the destination column.
    setBoard((prev) => {
      const cards = prev[to];
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex =
        over.id in prev
          ? cards.length - 1
          : cards.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev;
      }
      return { ...prev, [to]: arrayMove(cards, oldIndex, newIndex) };
    });

    if (start !== to) {
      const target = COLUMNS.find((c) => c.id === to);
      toast.success(`Moved “${card.title}” to ${target?.title}`);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Kanban board
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Drag cards within and between columns to reorder and update status.
          Built on dnd-kit — pointer + keyboard accessible, with a live
          insertion gap and a lifted drag overlay. The board lives in local
          state and reports each cross-column move with a toast.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-0.5 flex min-h-0 flex-1 gap-4 overflow-x-auto px-0.5 pb-2">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={board[column.id]}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? <CardView card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  cards,
}: {
  id: ColumnId;
  title: string;
  cards: KanbanCard[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 min-w-72 flex-1 flex-col gap-3 rounded-none border border-border bg-muted/30 p-3 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex shrink-0 items-center justify-between px-1">
        <h2 className="font-heading text-sm font-medium">{title}</h2>
        <Badge variant="outline">{cards.length}</Badge>
      </div>

      {/* Pad all sides: cards outline with `ring-1` (drawn outside the box) and
          would clip top/bottom at the scroll edges otherwise. */}
      <div className="-m-0.5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-0.5">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              Drop cards here
            </p>
          ) : (
            cards.map((card) => <SortableCard key={card.id} card={card} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableCard({ card }: { card: KanbanCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // The placeholder left behind while dragging fades to a dashed outline so
      // the insertion gap reads clearly.
      className={cn(isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <CardView card={card} />
    </div>
  );
}

function CardView({
  card,
  overlay = false,
}: {
  card: KanbanCard;
  overlay?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "cursor-grab active:cursor-grabbing",
        overlay && "scale-[1.02] cursor-grabbing shadow-lg",
      )}
    >
      <CardContent className="flex items-start gap-2">
        <DotsSixVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{card.title}</p>
          <Badge variant={TAG_VARIANT[card.tag] ?? "outline"}>{card.tag}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
