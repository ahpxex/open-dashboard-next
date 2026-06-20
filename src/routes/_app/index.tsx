import {
  CurrencyDollarIcon,
  PackageIcon,
  ReceiptIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart,
  ChartCard,
  PieChart,
  StatCard,
  type StatCardProps,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ordersListQuery } from "@/features/orders/queries";
import type { OrderListParams } from "@/features/orders/schema";
import { productsListQuery } from "@/features/products/queries";
import type { ProductListParams } from "@/features/products/schema";

/**
 * Store overview — the app home (`/`) and the canonical example for the
 * `add-chart-page` skill. A dashboard composed from the live `products` and
 * `orders` resources: KPI StatCards, a Bar + Pie ChartCard pair, a recent-items
 * list, and quick actions. Copy this file's shape to build any metrics screen.
 */

const ALL_PRODUCTS: ProductListParams = {
  page: 1,
  pageSize: 100,
  search: "",
  status: "",
};

const ALL_ORDERS: OrderListParams = {
  page: 1,
  pageSize: 100,
  search: "",
  status: "",
};

export const Route = createFileRoute("/_app/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsListQuery(ALL_PRODUCTS)),
      context.queryClient.ensureQueryData(ordersListQuery(ALL_ORDERS)),
    ]);
  },
  component: StoreOverview,
});

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";

const QUICK_ACTIONS = [
  { label: "Manage products", to: "/products" },
  { label: "View orders", to: "/orders" },
  { label: "Customers", to: "/customers" },
  { label: "Write a post", to: "/posts" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function StoreOverview() {
  const { user } = Route.useRouteContext();
  const productsQuery = useQuery(productsListQuery(ALL_PRODUCTS));
  const ordersQuery = useQuery(ordersListQuery(ALL_ORDERS));

  const products = productsQuery.data?.rows ?? [];
  const orders = ordersQuery.data?.rows ?? [];

  const { stats, productsByCategory, productsByStatus, recentProducts } =
    useMemo(() => {
      const available = products.filter((p) => p.status === "available").length;
      const outOfStock = products.filter(
        (p) => p.status === "out_of_stock",
      ).length;
      const inventoryValue = products.reduce(
        (sum, p) => sum + p.price * p.stock,
        0,
      );
      const activeOrders = orders.filter((o) => o.status === "active").length;

      const statCards: StatCardProps[] = [
        {
          label: "Products",
          value: (
            productsQuery.data?.total ?? products.length
          ).toLocaleString(),
          icon: PackageIcon,
          sub: `${available} available`,
        },
        {
          label: "Inventory value",
          value: formatCurrency(inventoryValue),
          icon: CurrencyDollarIcon,
          sub: `across ${products.length} SKUs`,
        },
        {
          label: "Out of stock",
          value: String(outOfStock),
          icon: WarningIcon,
          sub: `of ${products.length} products`,
        },
        {
          label: "Orders",
          value: (ordersQuery.data?.total ?? orders.length).toLocaleString(),
          icon: ReceiptIcon,
          sub: `${activeOrders} active`,
        },
      ];

      const categoryCounts = new Map<string, number>();
      for (const product of products) {
        categoryCounts.set(
          product.category,
          (categoryCounts.get(product.category) ?? 0) + 1,
        );
      }
      const categoryData = [...categoryCounts.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      const statusData = [
        { name: "Available", value: available },
        { name: "Out of stock", value: outOfStock },
        {
          name: "Discontinued",
          value: products.filter((p) => p.status === "discontinued").length,
        },
      ].filter((entry) => entry.value > 0);

      const recent = [...products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      return {
        stats: statCards,
        productsByCategory: categoryData,
        productsByStatus: statusData,
        recentProducts: recent,
      };
    }, [products, orders, productsQuery.data?.total, ordersQuery.data?.total]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Store overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/products"
            className={buttonVariants({ variant: "outline" })}
          >
            View products
          </Link>
          <Link to="/orders" className={buttonVariants()}>
            View orders
          </Link>
        </div>
      </div>

      {/* Stats — computed from the live products / orders resources */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts — derived from the same resource data */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Products by category"
          action={<Badge variant="secondary">{products.length} total</Badge>}
        >
          <BarChart
            data={productsByCategory}
            xKey="name"
            bars={[{ key: "value", label: "Products" }]}
          />
        </ChartCard>

        <ChartCard
          title="Products by status"
          action={
            <Badge variant="secondary">{productsByStatus.length} states</Badge>
          }
        >
          <PieChart data={productsByStatus} nameKey="name" valueKey="value" />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent products</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="grid size-8 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.category} · {product.sku}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ))}
            {recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full justify-start",
                })}
              >
                {action.label}
              </Link>
            ))}

            <div className="mt-3 border border-border bg-muted/40 p-4">
              <p className="mb-3 text-sm font-semibold">System status</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">API</span>
                  <Badge variant="outline" className={trendUpBadge}>
                    <span className="size-1.5 bg-green-500" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Database
                  </span>
                  <Badge variant="outline" className={trendUpBadge}>
                    <span className="size-1.5 bg-green-500" />
                    Healthy
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
