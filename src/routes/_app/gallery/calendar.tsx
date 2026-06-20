import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/calendar")({
  component: CalendarDemo,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Events shown per day cell before collapsing the rest into a "+N more" row. */
const MAX_VISIBLE_EVENTS = 3;

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

type CalendarEvent = {
  day: number;
  label: string;
  variant: "default" | "secondary" | "outline";
};

// Deterministic events keyed to specific day numbers in the reference month.
const EVENTS: CalendarEvent[] = [
  { day: 4, label: "Kickoff", variant: "default" },
  // Day 12 intentionally overflows the per-cell cap to demo the "+N more" row.
  { day: 12, label: "Design review", variant: "secondary" },
  { day: 12, label: "1:1", variant: "outline" },
  { day: 12, label: "Standup", variant: "outline" },
  { day: 12, label: "Demo", variant: "default" },
  { day: 18, label: "Ship v2", variant: "default" },
  { day: 25, label: "Retro", variant: "outline" },
];

function CalendarDemo() {
  const [ref, setRef] = useState({ year: 2026, month: 5 });

  const grid = useMemo(() => {
    // Derived from state, not the wall clock.
    const firstDay = new Date(ref.year, ref.month, 1).getDay();
    const daysInMonth = new Date(ref.year, ref.month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [ref.year, ref.month]);

  function shift(delta: number) {
    setRef((prev) => {
      const next = prev.month + delta;
      const year = prev.year + Math.floor(next / 12);
      const month = ((next % 12) + 12) % 12;
      return { year, month };
    });
  }

  function eventsFor(day: number) {
    return EVENTS.filter((e) => e.day === day);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Calendar view
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A month grid computed from a fixed reference month in state. Prev/Next
          step the month; events are pinned to specific day numbers and render
          as badges inside their cells.
        </p>
      </div>

      <div className="rounded-none border border-border bg-card">
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
            const events = day ? eventsFor(day) : [];
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
                    <span className="text-xs font-medium text-muted-foreground">
                      {day}
                    </span>
                    <div className="flex flex-col gap-1">
                      {events.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                        <Badge
                          key={event.label}
                          variant={event.variant}
                          className="w-full justify-start truncate"
                        >
                          {event.label}
                        </Badge>
                      ))}
                      {events.length > MAX_VISIBLE_EVENTS ? (
                        <span className="px-1 text-[11px] text-muted-foreground">
                          +{events.length - MAX_VISIBLE_EVENTS} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
