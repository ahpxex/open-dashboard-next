import {
  CaretRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DescriptionList, StatusChip } from "@/infra/ui";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/detail-related")({
  component: DetailRelatedDemo,
});

type OrderStatus = "fulfilled" | "processing" | "refunded";

const orderColorMap: Record<OrderStatus, "success" | "warning" | "danger"> = {
  fulfilled: "success",
  processing: "warning",
  refunded: "danger",
};
const orderLabelMap: Record<OrderStatus, string> = {
  fulfilled: "Fulfilled",
  processing: "Processing",
  refunded: "Refunded",
};

const RELATED_ORDERS: {
  id: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
}[] = [
  {
    id: "ORD-2048",
    date: "2026-05-14",
    items: 3,
    total: "$184.00",
    status: "fulfilled",
  },
  {
    id: "ORD-2031",
    date: "2026-05-02",
    items: 1,
    total: "$49.00",
    status: "processing",
  },
  {
    id: "ORD-1997",
    date: "2026-04-21",
    items: 5,
    total: "$312.50",
    status: "fulfilled",
  },
  {
    id: "ORD-1960",
    date: "2026-04-08",
    items: 2,
    total: "$98.00",
    status: "refunded",
  },
  {
    id: "ORD-1924",
    date: "2026-03-27",
    items: 4,
    total: "$240.00",
    status: "fulfilled",
  },
];

/**
 * Detail page with a related list. Gallery demo: a record header (status +
 * edit/delete), a DescriptionList of the record's fields, then a "Related
 * orders" section scoped to this record rendered as a compact table.
 */
function DetailRelatedDemo() {
  const confirm = useConfirm();

  async function onDelete() {
    const ok = await confirm({
      title: "Delete “Acme Corporation”?",
      description: "This will remove the customer and detach its orders.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) toast.success("Customer deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Detail with related lists
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A single-record view: a header with actions, a field summary, and a
          related collection (orders) scoped to the record below it.
        </p>
      </div>

      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground hover:underline">
          Customers
        </Link>
        <CaretRightIcon size={12} />
        <span className="text-foreground">Acme Corporation</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Acme Corporation
            </h2>
            <Badge
              variant="outline"
              className="border-transparent bg-green-500/15 text-green-700 dark:text-green-400"
            >
              Active
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">CUST-0571</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Edit customer")}
          >
            <PencilSimpleIcon size={16} />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <TrashIcon size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="border border-border p-6">
        <DescriptionList
          columns={3}
          items={[
            { label: "Primary contact", value: "Dana Whitfield" },
            { label: "Email", value: "billing@acme.example" },
            { label: "Phone", value: "+1 (415) 555-0148" },
            { label: "Plan", value: "Enterprise" },
            { label: "Lifetime value", value: "$18,420.00" },
            { label: "Customer since", value: "2024-02-11" },
            {
              label: "Billing address",
              value: "300 Market Street, Suite 1200, San Francisco, CA 94105",
              full: true,
            },
          ]}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Related orders</h3>
          <span className="text-xs text-muted-foreground">
            {RELATED_ORDERS.length} orders
          </span>
        </div>
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELATED_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.date}
                  </TableCell>
                  <TableCell className="text-right">{order.items}</TableCell>
                  <TableCell className="text-right font-medium">
                    {order.total}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      status={order.status}
                      colorMap={orderColorMap}
                      labelMap={orderLabelMap}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
