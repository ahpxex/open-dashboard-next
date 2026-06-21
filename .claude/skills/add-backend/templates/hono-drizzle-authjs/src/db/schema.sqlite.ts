/**
 * SQLite (bun:sqlite) schema — the zero-config default.
 *
 * Auth.js v5 runs with a **JWT session strategy** (required by the Credentials
 * provider), so there are no server-side session / account / verification rows
 * to persist — the session lives entirely in the signed cookie. We therefore
 * keep just two tables: the `users` table the Credentials `authorize` callback
 * verifies against (bcrypt-hashed `passwordHash`), and the `products` business
 * table from CONTRACT.md §0.
 */
import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull(),
  status: text("status").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const schema = { products, users };
