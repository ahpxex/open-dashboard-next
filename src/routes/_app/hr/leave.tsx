import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeaveFormDialog } from "@/features/leave-requests/LeaveFormDialog";
import { leaveRequestsListQuery } from "@/features/leave-requests/queries";
import {
  allLeaveParams,
  type LeaveRequest,
  type LeaveType,
} from "@/features/leave-requests/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/hr/leave")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(leaveRequestsListQuery(allLeaveParams)),
  component: LeaveCalendar,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TYPE_VARIANT: Record<LeaveType, "default" | "secondary" | "outline"> = {
  vacation: "default",
  sick: "secondary",
  personal: "outline",
};

const pad = (value: number) => String(value).padStart(2, "0");

type DialogState = {
  open: boolean;
  mode: "create" | "edit";
  leave?: LeaveRequest;
  date: string;
};

function LeaveCalendar() {
  const query = useQuery(leaveRequestsListQuery(allLeaveParams));
  const leave = query.data?.rows ?? [];

  const [ref, setRef] = useState({ year: 2026, month: 5 });
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: "create",
    date: "",
  });

  const grid = useMemo(() => {
    const firstDay = new Date(ref.year, ref.month, 1).getDay();
    const daysInMonth = new Date(ref.year, ref.month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [ref.year, ref.month]);

  const byDay = useMemo(() => {
    const prefix = `${ref.year}-${pad(ref.month + 1)}-`;
    const map = new Map<number, LeaveRequest[]>();
    for (const request of leave) {
      if (!request.date.startsWith(prefix)) continue;
      const day = Number(request.date.slice(-2));
      const list = map.get(day) ?? [];
      list.push(request);
      map.set(day, list);
    }
    return map;
  }, [leave, ref.year, ref.month]);

  function shift(delta: number) {
    setRef((prev) => {
      const next = prev.month + delta;
      const year = prev.year + Math.floor(next / 12);
      const month = ((next % 12) + 12) % 12;
      return { year, month };
    });
  }

  const openCreate = (date: string) =>
    setDialog({ open: true, mode: "create", date, leave: undefined });
  const openEdit = (request: LeaveRequest) =>
    setDialog({ open: true, mode: "edit", date: request.date, leave: request });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Time off
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Team leave on a month grid. Click a day to request time off, or a
            chip to edit it.
          </p>
        </div>
        <Button onClick={() => openCreate("")}>
          <PlusIcon size={16} />
          New leave
        </Button>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-heading text-base font-medium">
            {MONTH_NAMES[ref.month]} {ref.year}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => shift(-1)}
            >
              <CaretLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => shift(1)}
            >
              <CaretRightIcon />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day, i) => {
            const events = day ? (byDay.get(day) ?? []) : [];
            const isoDate = day
              ? `${ref.year}-${pad(ref.month + 1)}-${pad(day)}`
              : "";
            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-r border-b border-border p-1.5",
                  (i + 1) % 7 === 0 && "border-r-0",
                  day === null && "bg-muted/30",
                )}
              >
                {day !== null ? (
                  <div className="flex h-full flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => openCreate(isoDate)}
                      className="self-start rounded-none px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      aria-label={`Add leave on ${isoDate}`}
                    >
                      {day}
                    </button>
                    <div className="flex flex-col gap-1">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEdit(event)}
                          className="text-left"
                        >
                          <Badge
                            variant={TYPE_VARIANT[event.type]}
                            className="w-full justify-start truncate"
                          >
                            {event.employee}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <LeaveFormDialog
        open={dialog.open}
        mode={dialog.mode}
        leave={dialog.leave}
        defaultDate={dialog.date}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
      />
    </div>
  );
}
