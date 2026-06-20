/**
 * Role-based access control (authorization).
 *
 * Authentication answers "who are you" (the auth seam — `@/lib/auth-provider`,
 * `requireUser`). Authorization answers "what may you do" — and that lives here.
 * The template ships authentication but no authorization; this module adds a
 * small, explicit role/permission model you grow into your real roles.
 *
 * Deliberately dependency-free and client-safe: it imports nothing from `@/db`,
 * `@/lib/auth`, or any server-only module, so the pure helpers (`hasRole`, `can`)
 * can run in the browser to gate UI, while the server guard (`requireRole`) runs
 * only inside server-fn handlers. Wire it in by:
 *   1. adding a `role` column to the users table (default `"viewer"`),
 *   2. resolving the caller's role in protected server fns and calling
 *      `requireRole(role, [...])`, mirroring `requireUser()`,
 *   3. gating UI with `can(role, permission)` / the `<RoleGate>` component.
 *
 * See the `add-rbac` skill for the full walkthrough.
 */

/** The roles a user can hold. Order them most- to least-privileged. */
export type Role = "admin" | "editor" | "viewer";

/**
 * A capability that can be granted to a role. Use the `subject:action`
 * convention so permissions read naturally and group by subject. Extend this
 * union as you add subjects (e.g. `"billing:manage"`, `"user:invite"`).
 */
export type Permission =
  | "resource:read"
  | "resource:create"
  | "resource:update"
  | "resource:delete"
  | "settings:manage";

/** Every role in display order — handy for role pickers and admin screens. */
export const ROLES: readonly Role[] = ["admin", "editor", "viewer"];

/**
 * The permission matrix: which permissions each role is granted. This is the
 * single source of truth — edit it (not scattered `if (role === …)` checks) to
 * change what a role can do.
 *
 * - admin: everything, including managing settings.
 * - editor: full CRUD on resources, but not settings.
 * - viewer: read-only.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "resource:read",
    "resource:create",
    "resource:update",
    "resource:delete",
    "settings:manage",
  ],
  editor: [
    "resource:read",
    "resource:create",
    "resource:update",
    "resource:delete",
  ],
  viewer: ["resource:read"],
};

/** A human-readable label for each role (for menus, chips, etc.). */
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

/** Narrowing guard: is an arbitrary string one of our known roles? */
export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}

/**
 * Does `role` satisfy an allow-list? Pass a single role or an array; an empty
 * (or omitted) allow-list means "any authenticated role is fine".
 */
export function hasRole(role: Role, allowed?: Role | Role[]): boolean {
  if (allowed === undefined) return true;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (list.length === 0) return true;
  return list.includes(role);
}

/** Is `permission` granted to `role`? The core check the UI and server share. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Server-side authorization guard — call AFTER `requireUser()` inside a
 * protected server-fn handler, passing the caller's resolved role. Throws
 * `"FORBIDDEN"` (mirroring `requireUser`'s `"UNAUTHORIZED"` throw style) when the
 * role is not in the allow-list, so the boundary fails closed.
 *
 * Stays server-safe by importing nothing server-only itself — the handler
 * supplies the role (read from the session/DB) so this helper has no auth
 * dependency and the rule lives in one place.
 *
 *   const user = await requireUser();
 *   const role = await roleForUser(user.id); // your lookup
 *   requireRole(role, ["admin", "editor"]);
 */
export function requireRole(role: Role, allowed: Role | Role[]): Role {
  if (!hasRole(role, allowed)) {
    throw new Error("FORBIDDEN");
  }
  return role;
}

/**
 * Permission-flavoured server guard: assert the role holds a specific
 * permission. Same fail-closed `"FORBIDDEN"` throw as `requireRole`.
 */
export function requirePermission(role: Role, permission: Permission): Role {
  if (!can(role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return role;
}
