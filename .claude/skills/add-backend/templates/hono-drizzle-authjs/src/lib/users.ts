/**
 * User store helpers shared by the Auth.js Credentials `authorize` callback
 * (src/auth.ts) and the custom sign-up route (src/register.ts). Passwords are
 * always bcrypt-hashed — never stored or compared in plaintext.
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";

const BCRYPT_ROUNDS = 10;

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

/** Normalise an email for case-insensitive uniqueness + lookup. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findRowByEmail(email: string): Promise<UserRow | undefined> {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizeEmail(email)))
    .limit(1);
  return rows[0] as UserRow | undefined;
}

/** True when a user already exists for this email. */
export async function emailExists(email: string): Promise<boolean> {
  return Boolean(await findRowByEmail(email));
}

/**
 * Create a user with a bcrypt-hashed password. Returns the public user shape.
 * Throws `EMAIL_EXISTS` when the email is already taken so the caller can map it
 * to a 409.
 */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AppUser> {
  const email = normalizeEmail(input.email);
  if (await emailExists(email)) {
    throw new Error("EMAIL_EXISTS");
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await db.insert(schema.users).values({
    id,
    name: input.name,
    email,
    passwordHash,
  });

  return { id, name: input.name, email };
}

/**
 * Verify an email + password pair against the bcrypt hash. Returns the public
 * user shape on success, or `null` on any mismatch (unknown email or wrong
 * password) — the Credentials provider treats `null` as a failed sign-in.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AppUser | null> {
  const row = await findRowByEmail(email);
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) return null;
  return { id: row.id, name: row.name, email: row.email };
}
