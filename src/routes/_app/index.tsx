import {
  ChartLineIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  BarChart,
  CHART_PRIMARY,
  CHART_SECONDARY,
  ChartCard,
  PieChart,
  StatCard,
  type StatCardProps,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  categoryData,
  monthlyRevenueData,
  trafficSourceData,
} from "@/lib/dashboard/chart-data";

export const Route = createFileRoute("/_app/")({
  component: DashboardHome,
});

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";

const STATS: StatCardProps[] = [
  {
    label: "Total Users",
    value: "1,234",
    icon: UsersIcon,
    trend: { value: "12%", up: true },
    progress: 65,
    sub: "65% of monthly target",
  },
  {
    label: "Revenue",
    value: "$45,678",
    icon: CurrencyDollarIcon,
    trend: { value: "8%", up: true },
    progress: 78,
    sub: "78% of monthly target",
  },
  {
    label: "Active Sessions",
    value: "432",
    icon: ClockIcon,
    trend: { value: "5%", up: true },
    progress: 43,
    sub: "Peak: 542 sessions",
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    icon: ChartLineIcon,
    trend: { value: "2%", up: false },
    progress: 32,
    sub: "Industry avg: 3.5%",
  },
];

const ACTIVITY = [
  { user: "John Doe", action: "Created new project", time: "2 min ago" },
  { user: "Jane Smith", action: "Updated dashboard", time: "15 min ago" },
  { user: "Bob Wilson", action: "Added new users", time: "1 hour ago" },
  { user: "Alice Brown", action: "Generated report", time: "2 hours ago" },
];

function DashboardHome() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Create New</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Revenue & Users Trend"
          action={<Badge variant="secondary">Last 7 months</Badge>}
        >
          <AreaChart
            data={monthlyRevenueData}
            xKey="name"
            series={[
              { key: "revenue", label: "Revenue", color: CHART_PRIMARY },
              { key: "users", label: "Users", color: CHART_SECONDARY },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Product Performance"
          action={<Badge variant="secondary">Top 5 Products</Badge>}
        >
          <BarChart
            data={categoryData}
            xKey="name"
            bars={[{ key: "value", label: "Sales" }]}
          />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Traffic Sources">
          <PieChart data={trafficSourceData} nameKey="name" valueKey="value" />
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {ACTIVITY.map((activity) => (
              <div
                key={activity.user}
                className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="grid size-8 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {activity.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Button className="w-full justify-start" variant="outline">
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Invite Team Member
            </Button>
            <Button className="w-full justify-start" variant="outline">
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Manage Settings
            </Button>

            <div className="mt-3 border border-border bg-muted/40 p-4">
              <p className="mb-3 text-sm font-semibold">System Status</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    API Status
                  </span>
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <Badge
                    variant="outline"
                    className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  >
                    <span className="size-1.5 bg-amber-500" />
                    72% Used
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
