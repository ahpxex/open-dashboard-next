import type { Order } from "@/db/schema";

/**
 * Seed rows for the zero-config in-memory backend (used when `DATABASE_URL` is
 * unset). Only loaded by `memoryRepository` in `server.ts`; ignored once a real
 * Postgres backend is configured. Repo-only — the scaffold base ships without
 * the demo resources.
 */
const at = (iso: string) => new Date(iso);

export const demoOrders: Order[] = [
  {
    id: "22222222-2222-4222-8222-000000000001",
    name: "Order #1024 — Acme Corp",
    status: "active",
    description: "12× Aurora Wireless Headphones, net-30.",
    createdAt: at("2026-01-10T09:15:00Z"),
    updatedAt: at("2026-01-10T09:15:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    name: "Order #1025 — Globex",
    status: "active",
    description: "Bulk apparel restock.",
    createdAt: at("2026-01-11T13:40:00Z"),
    updatedAt: at("2026-01-12T10:00:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    name: "Order #1026 — Initech",
    status: "archived",
    description: "Completed and shipped.",
    createdAt: at("2026-01-05T08:00:00Z"),
    updatedAt: at("2026-01-09T17:30:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000004",
    name: "Order #1027 — Umbrella",
    status: "active",
    description: "Awaiting payment confirmation.",
    createdAt: at("2026-01-14T11:25:00Z"),
    updatedAt: at("2026-01-14T11:25:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000005",
    name: "Order #1028 — Soylent",
    status: "active",
    description: "Recurring monthly grocery order.",
    createdAt: at("2026-01-16T15:10:00Z"),
    updatedAt: at("2026-01-16T15:10:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000006",
    name: "Order #1029 — Hooli",
    status: "archived",
    description: "Cancelled by customer.",
    createdAt: at("2026-01-03T10:45:00Z"),
    updatedAt: at("2026-01-07T09:00:00Z"),
  },
];
