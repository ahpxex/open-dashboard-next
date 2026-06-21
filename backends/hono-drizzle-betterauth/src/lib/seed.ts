/**
 * Dev-only seed for the zero-config SQLite path (CONTRACT.md §2b / stack spec):
 * a known account (dev@example.com / password) so the frontend's "Dev quick
 * login" works out of the box, plus a couple of sample products. Never runs with
 * a real database or in production.
 */
import { sql } from "drizzle-orm";
import { auth } from "../auth";
import { db, schema } from "../db";
import { hasDatabase, isProduction } from "./env";

export async function seedDev(): Promise<void> {
  if (hasDatabase || isProduction) return;

  // Seed the dev account through better-auth so the password is hashed exactly
  // the way the login flow expects. Ignore "already exists" on hot reload.
  await auth.api
    .signUpEmail({
      body: {
        email: "dev@example.com",
        password: "password",
        name: "Dev User",
      },
    })
    .catch(() => {});

  // Seed sample products only when the table is empty.
  const countRows = await db
    .select({ value: sql<number>`count(*)` })
    .from(schema.products);
  if (Number(countRows[0]?.value ?? 0) > 0) return;

  const now = Date.now();
  const samples = [
    {
      name: "Aurora Wireless Headphones",
      sku: "AUR-001",
      category: "Audio",
      price: 199.99,
      stock: 42,
      status: "available",
      description: "Over-ear ANC headphones.",
    },
    {
      name: "Nimbus Mechanical Keyboard",
      sku: "NIM-114",
      category: "Peripherals",
      price: 129.0,
      stock: 0,
      status: "out_of_stock",
      description: "Hot-swappable, tactile switches.",
    },
    {
      name: "Helios Desk Lamp",
      sku: "HEL-220",
      category: "Lighting",
      price: 59.5,
      stock: 130,
      status: "available",
      description: "Adjustable colour temperature.",
    },
  ];

  await db.insert(schema.products).values(
    samples.map((p, i) => {
      const ts = new Date(now - i * 60_000).toISOString();
      return { id: crypto.randomUUID(), ...p, createdAt: ts, updatedAt: ts };
    }),
  );
}
