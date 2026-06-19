import {
  BellIcon,
  PulseIcon,
  WarningIcon,
  XCircleIcon,
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
import { buttonVariants } from "@/components/ui/button";
import { alertsListQuery } from "@/features/alerts/queries";
import { allAlertsParams } from "@/features/alerts/schema";
import { devicesListQuery } from "@/features/devices/queries";
import { allDevicesParams, type DeviceStatus } from "@/features/devices/schema";

export const Route = createFileRoute("/_app/fleet/")({
  // Device data (10k rows) is fetched client-side; not embedded in SSR.
  component: FleetOverview,
});

function FleetOverview() {
  const devicesQuery = useQuery(devicesListQuery(allDevicesParams));
  const alertsQuery = useQuery(alertsListQuery(allAlertsParams));
  const devices = devicesQuery.data?.rows ?? [];
  const alerts = alertsQuery.data?.rows ?? [];

  const { stats, byStatus, byLocation } = useMemo(() => {
    const count = (status: DeviceStatus) =>
      devices.filter((device) => device.status === status).length;
    const critical = alerts.filter(
      (alert) => alert.severity === "critical",
    ).length;

    const statCards: StatCardProps[] = [
      {
        label: "Online",
        value: count("online").toLocaleString(),
        icon: PulseIcon,
        sub: `of ${devices.length.toLocaleString()} devices`,
      },
      {
        label: "Degraded",
        value: count("degraded").toLocaleString(),
        icon: WarningIcon,
        sub: "Needs a look",
      },
      {
        label: "Offline",
        value: count("offline").toLocaleString(),
        icon: XCircleIcon,
        sub: "Not reporting",
      },
      {
        label: "Critical alerts",
        value: String(critical),
        icon: BellIcon,
        sub: "Last 48h",
      },
    ];

    const statusData = [
      { name: "Online", value: count("online") },
      { name: "Degraded", value: count("degraded") },
      { name: "Offline", value: count("offline") },
    ];

    const locationMap = new Map<string, number>();
    for (const device of devices) {
      locationMap.set(
        device.location,
        (locationMap.get(device.location) ?? 0) + 1,
      );
    }
    const locationData = Array.from(locationMap, ([name, value]) => ({
      name,
      value,
    }));

    return { stats: statCards, byStatus: statusData, byLocation: locationData };
  }, [devices, alerts]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Fleet overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Device health and recent alerts across the fleet.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/fleet/alerts"
            className={buttonVariants({ variant: "outline" })}
          >
            View alerts
          </Link>
          <Link to="/fleet/devices" className={buttonVariants()}>
            All devices
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Devices by status">
          <BarChart
            data={byStatus}
            xKey="name"
            bars={[{ key: "value", label: "Devices" }]}
          />
        </ChartCard>
        <ChartCard title="Devices by region">
          <PieChart data={byLocation} nameKey="name" valueKey="value" />
        </ChartCard>
      </div>
    </div>
  );
}
