import { createFileRoute } from "@tanstack/react-router";
import { type UIEvent, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/gallery/table-virtual")({
  component: TableVirtualDemo,
});

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Katherine",
  "Linus",
  "Margaret",
  "Dennis",
  "Barbara",
  "Ken",
  "Radia",
  "Tim",
  "Hedy",
  "John",
  "Joan",
];
const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Torvalds",
  "Hamilton",
  "Ritchie",
  "Liskov",
  "Thompson",
  "Perlman",
];

type Row = {
  id: number;
  name: string;
  email: string;
  amount: number;
};

const ROW_COUNT = 5000;
const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 480;
const OVERSCAN = 8;

const ROWS: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => {
  const name = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
  const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: i + 1,
    name,
    email: `${handle}.${i + 1}@acme.dev`,
    // Deterministic, varied-looking amount derived from index.
    amount: 1000 + ((i * 37) % 9000) + (i % 100),
  };
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Virtualized table — windows 5,000 deterministic rows with hand-rolled
 * scroll math (no extra dependency). A fixed-height scroll container renders
 * only the visible slice plus a small overscan; top/bottom spacers preserve
 * the total scroll height, and the header row stays sticky.
 */
function TableVirtualDemo() {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    ROW_COUNT,
    startIndex + visibleCount + OVERSCAN * 2,
  );
  const slice = ROWS.slice(startIndex, endIndex);

  const topSpacer = startIndex * ROW_HEIGHT;
  const bottomSpacer = (ROW_COUNT - endIndex) * ROW_HEIGHT;

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Virtualized table (5k rows)
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {ROW_COUNT.toLocaleString()} rows rendered through manual windowing —
          only the visible slice is in the DOM, with spacer rows preserving the
          scroll height. No virtualization library, sticky header.
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="mb-2 text-muted-foreground text-xs tabular-nums">
          {ROW_COUNT.toLocaleString()} total rows · rendering {slice.length} in
          the viewport
        </div>

        <div
          onScroll={onScroll}
          className="overflow-auto border border-border"
          style={{ height: VIEWPORT_HEIGHT }}
        >
          <Table className="border-separate border-spacing-0">
            <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b-0">
              <TableRow>
                <TableHead className="w-20 border-border border-b bg-card">
                  ID
                </TableHead>
                <TableHead className="border-border border-b bg-card">
                  Name
                </TableHead>
                <TableHead className="border-border border-b bg-card">
                  Email
                </TableHead>
                <TableHead className="border-border border-b bg-card text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSpacer > 0 && (
                <tr aria-hidden style={{ height: topSpacer }}>
                  <td colSpan={4} />
                </tr>
              )}
              {slice.map((row) => (
                <TableRow key={row.id} style={{ height: ROW_HEIGHT }}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {row.id}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.email}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currency.format(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {bottomSpacer > 0 && (
                <tr aria-hidden style={{ height: bottomSpacer }}>
                  <td colSpan={4} />
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
