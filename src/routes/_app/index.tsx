import {
  ListChecksIcon,
  TicketIcon,
  UserCircleIcon,
  UsersIcon,
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
import { redemptionCodesListQuery } from "@/features/redemption-codes/queries";
import { allCodesParams } from "@/features/redemption-codes/schema";
import { tasksListQuery } from "@/features/tasks/queries";
import { allTasksParams } from "@/features/tasks/schema";
import { usersListQuery } from "@/features/users/queries";
import type { UserListParams } from "@/features/users/schema";

const ALL_USERS: UserListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  role: "",
  status: "",
};

export const Route = createFileRoute("/_app/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(usersListQuery(ALL_USERS)),
      context.queryClient.ensureQueryData(tasksListQuery(allTasksParams)),
      context.queryClient.ensureQueryData(
        redemptionCodesListQuery(allCodesParams),
      ),
    ]);
  },
  component: TaoracleOverview,
});

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";

const QUICK_ACTIONS = [
  { label: "Manage users", to: "/taoracle/users" },
  { label: "Create a code", to: "/taoracle/affiliate" },
  { label: "Open task board", to: "/taoracle/tasks" },
  { label: "Write a post", to: "/posts" },
];

function TaoracleOverview() {
  const { user } = Route.useRouteContext();
  const usersQuery = useQuery(usersListQuery(ALL_USERS));
  const tasksQuery = useQuery(tasksListQuery(allTasksParams));
  const codesQuery = useQuery(redemptionCodesListQuery(allCodesParams));

  const users = usersQuery.data?.rows ?? [];
  const tasks = tasksQuery.data?.rows ?? [];
  const codes = codesQuery.data?.rows ?? [];

  const { stats, tasksByStatus, usersByRole, recentSignups } = useMemo(() => {
    const activeUsers = users.filter((u) => u.status === "active").length;
    const openTasks = tasks.filter((t) => t.status !== "done").length;
    const codesRedeemed = codes.reduce((sum, c) => sum + c.usedCount, 0);

    const statCards: StatCardProps[] = [
      {
        label: "Total Users",
        value: (usersQuery.data?.total ?? users.length).toLocaleString(),
        icon: UsersIcon,
        sub: `${activeUsers} active`,
      },
      {
        label: "Active Users",
        value: activeUsers.toLocaleString(),
        icon: UserCircleIcon,
        sub: `of ${users.length} accounts`,
      },
      {
        label: "Open Tasks",
        value: String(openTasks),
        icon: ListChecksIcon,
        sub: `${tasks.length - openTasks} done`,
      },
      {
        label: "Codes Redeemed",
        value: codesRedeemed.toLocaleString(),
        icon: TicketIcon,
        sub: `across ${codes.length} codes`,
      },
    ];

    const taskStatusData = [
      {
        name: "Backlog",
        value: tasks.filter((t) => t.status === "backlog").length,
      },
      { name: "Todo", value: tasks.filter((t) => t.status === "todo").length },
      {
        name: "In progress",
        value: tasks.filter((t) => t.status === "in_progress").length,
      },
      { name: "Done", value: tasks.filter((t) => t.status === "done").length },
    ];

    const roleData = [
      { name: "Admin", value: users.filter((u) => u.role === "admin").length },
      {
        name: "Member",
        value: users.filter((u) => u.role === "member").length,
      },
      {
        name: "Viewer",
        value: users.filter((u) => u.role === "viewer").length,
      },
    ].filter((entry) => entry.value > 0);

    const signups = [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      stats: statCards,
      tasksByStatus: taskStatusData,
      usersByRole: roleData,
      recentSignups: signups,
    };
  }, [users, tasks, codes, usersQuery.data?.total]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            taoracle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/taoracle/users"
            className={buttonVariants({ variant: "outline" })}
          >
            View users
          </Link>
          <Link to="/taoracle/affiliate" className={buttonVariants()}>
            New code
          </Link>
        </div>
      </div>

      {/* Stats — computed from the live users / tasks / codes resources */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts — derived from the same resource data */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Tasks by status"
          action={<Badge variant="secondary">{tasks.length} total</Badge>}
        >
          <BarChart
            data={tasksByStatus}
            xKey="name"
            bars={[{ key: "value", label: "Tasks" }]}
          />
        </ChartCard>

        <ChartCard
          title="Users by role"
          action={<Badge variant="secondary">{users.length} total</Badge>}
        >
          <PieChart data={usersByRole} nameKey="name" valueKey="value" />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent signups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {recentSignups.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="grid size-8 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                  {account.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{account.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {account.email}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  {new Date(account.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
