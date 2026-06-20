import {
  CreditCardIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Plan, PlanCard } from "@/components/billing/PlanCard";
import { UsageMeter } from "@/components/billing/UsageMeter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusChip } from "@/infra/ui";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/billing")({
  component: BillingDemo,
});

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "mo",
    description: "For trying things out.",
    features: ["1 project", "1 seat", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    cadence: "mo",
    description: "For growing teams.",
    features: [
      "Unlimited projects",
      "10 seats",
      "Priority support",
      "Usage analytics",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    cadence: "mo",
    description: "For scale and compliance.",
    features: [
      "Everything in Pro",
      "Unlimited seats",
      "SSO & SAML",
      "Dedicated success manager",
      "99.9% uptime SLA",
    ],
  },
];

type InvoiceStatus = "paid" | "open" | "void";

const INVOICES: {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
}[] = [
  { id: "INV-2026-0006", date: "2026-06-01", amount: 29, status: "open" },
  { id: "INV-2026-0005", date: "2026-05-01", amount: 29, status: "paid" },
  { id: "INV-2026-0004", date: "2026-04-01", amount: 29, status: "paid" },
  { id: "INV-2026-0003", date: "2026-03-01", amount: 29, status: "paid" },
  { id: "INV-2026-0002", date: "2026-02-01", amount: 0, status: "void" },
];

const invoiceColors = {
  paid: "success",
  open: "warning",
  void: "default",
} as const;

/**
 * Gallery demo: a provider-agnostic billing page — current-plan card with a
 * usage meter, a plan picker, a payment-method row, and an invoices table.
 * Mock/static data with a real, polished layout. Wire the CTAs to a Stripe
 * Checkout / Billing-Portal server fn (and a webhook for status) to make it
 * live — the layout stays the same.
 */
function BillingDemo() {
  const [currentPlanId, setCurrentPlanId] = useState("pro");
  const currentPlan = PLANS.find((p) => p.id === currentPlanId) ?? PLANS[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Plan, usage, payment method, and invoices. Provider-agnostic layout —
          back the buttons with a Stripe Checkout / Portal server fn and a
          webhook to make it live.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Current plan</CardTitle>
            <CardAction>
              <Button variant="outline" size="sm">
                Manage subscription
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-xl font-semibold text-foreground">
                  {currentPlan.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${currentPlan.price}/{currentPlan.cadence}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Renews on 2026-07-01
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <UsageMeter label="Seats" used={7} limit={10} />
              <UsageMeter label="Storage" used={42} limit={100} unit="GB" />
              <UsageMeter label="API calls" used={68200} limit={100000} />
              <UsageMeter label="Projects" used={12} limit={50} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border border-border p-3">
              <span className="grid size-9 shrink-0 place-items-center bg-muted text-muted-foreground">
                <CreditCardIcon size={18} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">
                  Visa •••• 4242
                </span>
                <span className="text-xs text-muted-foreground">
                  Expires 08 / 2028
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Edit payment method"
              >
                <PencilSimpleIcon size={16} />
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              Update payment method
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Change plan
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={plan.id === currentPlanId}
              onSelect={(id) => {
                setCurrentPlanId(id);
                toast.success(`Switched to ${plan.name}`);
              }}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-foreground">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      status={invoice.status}
                      colorMap={invoiceColors}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download ${invoice.id}`}
                      onClick={() => toast.success(`Downloading ${invoice.id}`)}
                    >
                      <DownloadSimpleIcon size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
