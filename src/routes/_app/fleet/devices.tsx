import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type UIEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { devicesListQuery } from "@/features/devices/queries";
import {
  allDevicesParams,
  type DeviceStatus,
  deviceStatuses,
} from "@/features/devices/schema";
import { type ChipColor, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/fleet/devices")({
  // The full fleet (10k rows) is fetched client-side and virtualized — too large
  // to embed in the SSR payload, so there is no loader prefetch here.
  component: DevicesTable,
});

const statusColorMap: Record<DeviceStatus, ChipColor> = {
  online: "success",
  degraded: "warning",
  offline: "danger",
};

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 520;
const OVERSCAN = 8;

function DevicesTable() {
  const query = useQuery(devicesListQuery(allDevicesParams));
  const devices = query.data?.rows ?? [];

  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const [scrollTop, setScrollTop] = useState(0);

  const filtered = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return devices.filter((device) => {
      if (status && device.status !== status) return false;
      if (
        term &&
        !`${device.name} ${device.model} ${device.location}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [devices, searchValue, status]);

  const rowCount = filtered.length;
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(rowCount, startIndex + visibleCount + OVERSCAN * 2);
  const slice = filtered.slice(startIndex, endIndex);
  const topSpacer = startIndex * ROW_HEIGHT;
  const bottomSpacer = (rowCount - endIndex) * ROW_HEIGHT;

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Devices
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The full fleet, virtualized — only the visible rows are in the DOM.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search devices…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-9 w-56"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value && value !== "all" ? value : "")
          }
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {deviceStatuses.map((value) => (
              <SelectItem key={value} value={value}>
                <span className="capitalize">{value}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {query.isLoading
            ? "Loading devices…"
            : `${rowCount.toLocaleString()} of ${devices.length.toLocaleString()} devices · rendering ${slice.length}`}
        </span>
      </div>

      <div
        onScroll={onScroll}
        className="overflow-auto border border-border"
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <Table className="border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b-0">
            <TableRow>
              <TableHead className="border-border border-b bg-card">
                Device
              </TableHead>
              <TableHead className="border-border border-b bg-card">
                Model
              </TableHead>
              <TableHead className="border-border border-b bg-card">
                Status
              </TableHead>
              <TableHead className="border-border border-b bg-card">
                Location
              </TableHead>
              <TableHead className="border-border border-b bg-card">
                Firmware
              </TableHead>
              <TableHead className="border-border border-b bg-card text-right">
                Uptime
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSpacer > 0 && (
              <tr aria-hidden style={{ height: topSpacer }}>
                <td colSpan={6} />
              </tr>
            )}
            {slice.map((device) => (
              <TableRow key={device.id} style={{ height: ROW_HEIGHT }}>
                <TableCell className="font-mono text-xs font-medium">
                  {device.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {device.model}
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={device.status}
                    colorMap={statusColorMap}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {device.location}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {device.firmware}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {device.uptime.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
            {bottomSpacer > 0 && (
              <tr aria-hidden style={{ height: bottomSpacer }}>
                <td colSpan={6} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
