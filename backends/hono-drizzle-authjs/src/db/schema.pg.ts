/**
 * Postgres schema (drizzle-orm/node-postgres) — the production path, used when
 * `DATABASE_URL` is set. Same logical shape as the SQLite schema: the `products`
 * business table plus the `users` table the Auth.js Credentials provider
 * verifies against. Auth.js runs JWT sessions, so no session/account tables.
 */
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(),
  price: doublePrecision("price").notNull(),
  stock: integer("stock").notNull(),
  status: text("status").notNull(),
  description: text("description").notNull().default(""),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const schema = { products, users };
