/**
 * Custom sign-up route — CONTRACT.md §2c. Auth.js has no register endpoint, so we
 * add `POST /api/auth/register` (mounted in src/app.ts BEFORE the Auth.js handler
 * so it wins the path) that creates a bcrypt-hashed user. After this, the next
 * `POST /api/auth/callback/credentials` for the same email + password succeeds.
 *
 *   201 { user: { id, name, email } }  on success
 *   409 { error }                      when the email already exists
 *   400 { error, details? }            on invalid input
 */
import { Hono } from "hono";
import { z } from "zod";
import { createUser } from "./lib/users";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

export const registerRoutes = new Hono();

registerRoutes.post("/register", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  try {
    const user = await createUser(parsed.data);
    return c.json({ user }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_EXISTS") {
      return c.json({ error: "Email already registered" }, 409);
    }
    throw err;
  }
});
