import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Order } from "@/db/schema";
import { createOrdersColumns } from "@/features/orders/columns";
import { ordersFilters, ordersTableConfig } from "@/features/orders/config";
import {
  ordersListQuery,
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrder,
} from "@/features/orders/queries";
import {
  type OrderInput,
  type OrderListParams,
  ordersStatuses,
} from "@/features/orders/schema";
import { DataTable } from "@/infra/table";

const DEFAULT_PARAMS: OrderListParams = {
  page: 1,
  pageSize: ordersTableConfig.defaultPageSize,
  search: "",
  status: "",
  sortBy: undefined,
  sortDir: undefined,
};

export const Route = createFileRoute("/_app/orders")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersListQuery(DEFAULT_PARAMS)),
  component: OrdersPage,
});

type DialogState = { mode: "create" | "edit"; row?: Order } | null;

function OrdersPage() {
  const [page, setPage] = useState(DEFAULT_PARAMS.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PARAMS.pageSize);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialog, setDialog] = useState<DialogState>(null);

  const params: OrderListParams = {
    page,
    pageSize,
    search,
    status,
    sortBy: sorting[0]?.id,
    sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
  };

  const query = useQuery({
    ...ordersListQuery(params),
    placeholderData: keepPreviousData,
  });
  const remove = useDeleteOrder();

  const columns = useMemo(
    () =>
      createOrdersColumns({
        onEdit: (row) => setDialog({ mode: "edit", row }),
        onDelete: (row) => {
          if (window.confirm(`Delete "${row.name}"?`)) remove.mutate(row.id);
        },
      }),
    [remove],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Generated resource — customise the schema and columns to fit.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={ordersTableConfig.searchPlaceholder}
        filters={ordersFilters}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatus(value);
            setPage(1);
          }
        }}
        onRefresh={() => query.refetch()}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting(updater);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={ordersTableConfig.pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage={ordersTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add orders
          </Button>
        }
      />

      <OrderFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        row={dialog?.row}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}

const EMPTY_FORM: OrderInput = {
  name: "",
  status: "active",
  description: "",
};

function toForm(row?: Order): OrderInput {
  if (!row) return { ...EMPTY_FORM };
  return {
    name: row.name,
    status: row.status as OrderInput["status"],
    description: row.description ?? "",
  };
}

function OrderFormDialog({
  open,
  mode,
  row,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  row?: Order;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const [form, setForm] = useState<OrderInput>(() => toForm(row));
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on open
  useEffect(() => {
    if (open) {
      setForm(toForm(row));
      setError(null);
    }
  }, [open, row]);

  const pending = create.isPending || update.isPending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "edit" && row) {
        await update.mutateAsync({ id: row.id, ...form });
      } else {
        await create.mutateAsync(form);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit orders" : "New orders"}
          </DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value as OrderInput["status"] })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ordersStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
