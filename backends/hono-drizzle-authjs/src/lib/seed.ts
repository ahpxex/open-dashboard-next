/**
 * Dev-only seed for the zero-config SQLite path (CONTRACT.md §2c / stack spec): a
 * known account (dev@example.com / password) so the frontend's "Dev quick login"
 * works out of the box, plus a couple of sample products. Never runs with a real
 * database or in production.
 *
 * The dev user is created through the same bcrypt helper the Credentials provider
 * verifies against, so the password hashes exactly the way sign-in expects.
 */
import { sql } from "drizzle-orm";
import { db, schema } from "../db";
import { hasDatabase, isProduction } from "./env";
import { createUser, emailExists } from "./users";

export async function seedDev(): Promise<void> {
  if (hasDatabase || isProduction) return;

  // Seed the dev account (bcrypt-hashed). Idempotent across hot reloads.
  if (!(await emailExists("dev@example.com"))) {
    await createUser({
      name: "Dev User",
      email: "dev@example.com",
      password: "password",
    }).catch(() => {});
  }

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
