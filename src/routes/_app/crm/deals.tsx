import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DealFormDialog } from "@/features/deals/DealFormDialog";
import { dealsListQuery, useUpdateDeal } from "@/features/deals/queries";
import {
  allDealsParams,
  type Deal,
  type DealStage,
  dealStages,
} from "@/features/deals/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/crm/deals")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dealsListQuery(allDealsParams)),
  component: DealsPipeline,
});

const COLUMN_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

type DialogState = { mode: "create" | "edit"; deal?: Deal } | null;

function DealsPipeline() {
  const query = useQuery(dealsListQuery(allDealsParams));
  const updateDeal = useUpdateDeal();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dragging, setDragging] = useState<{
    from: DealStage;
    id: string;
  } | null>(null);
  const [overColumn, setOverColumn] = useState<DealStage | null>(null);

  const deals = query.data?.rows ?? [];
  const grouped = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      won: [],
      lost: [],
    };
    for (const deal of deals) map[deal.stage].push(deal);
    return map;
  }, [deals]);

  function handleDrop(to: DealStage) {
    setOverColumn(null);
    if (!dragging) return;
    const { from, id } = dragging;
    setDragging(null);
    if (from === to) return;
    updateDeal.mutate({ id, stage: to });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag deals between stages. Click a card to edit.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          New deal
        </Button>
      </div>

      <div className="-mx-0.5 flex gap-4 overflow-x-auto px-0.5 pb-2">
        {dealStages.map((stage) => {
          const cards = grouped[stage];
          const total = cards.reduce((sum, deal) => sum + deal.value, 0);
          const isOver = overColumn === stage;
          return (
            <div
              key={stage}
              className={cn(
                "flex min-w-64 flex-1 flex-col gap-3 border border-border bg-muted/30 p-3 transition-colors",
                isOver && "border-primary bg-primary/5",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== stage) setOverColumn(stage);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn((prev) => (prev === stage ? null : prev));
                }
              }}
              onDrop={() => handleDrop(stage)}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="font-heading text-sm font-medium">
                  {COLUMN_LABELS[stage]}
                </h2>
                <Badge variant="outline">{currency(total)}</Badge>
              </div>

              <div className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
                {cards.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    No deals
                  </p>
                ) : (
                  cards.map((deal) => (
                    <Card
                      key={deal.id}
                      size="sm"
                      draggable
                      onDragStart={() =>
                        setDragging({ from: stage, id: deal.id })
                      }
                      onDragEnd={() => {
                        setDragging(null);
                        setOverColumn(null);
                      }}
                      onClick={() => setDialog({ mode: "edit", deal })}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        dragging?.id === deal.id && "opacity-50",
                      )}
                    >
                      <CardContent className="flex items-start gap-2">
                        <DotsSixVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="text-sm font-medium text-foreground">
                            {deal.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {deal.company}
                          </p>
                          <p className="text-xs font-medium tabular-nums">
                            {currency(deal.value)}
                          </p>
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

      <DealFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        deal={dialog?.deal}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
