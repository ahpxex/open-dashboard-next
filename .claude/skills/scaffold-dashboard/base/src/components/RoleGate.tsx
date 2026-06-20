import type { ReactNode } from "react";
import { can, hasRole, type Permission, type Role } from "@/lib/rbac";

/**
 * Conditionally render children based on the current user's role.
 *
 * The UI half of the RBAC model in `@/lib/rbac` (the server half is
 * `requireRole`). Gate any element behind a permission or a role allow-list;
 * when the check fails it renders `fallback` (nothing by default), so menus,
 * buttons, and whole panels appear only for users who may use them.
 *
 *   <RoleGate role={role} can="settings:manage">
 *     <SettingsPanel />
 *   </RoleGate>
 *
 *   <RoleGate role={role} allow={["admin", "editor"]} fallback={<ReadOnlyNote />}>
 *     <EditToolbar />
 *   </RoleGate>
 *
 * Visibility is a UX nicety, NOT a security boundary — always re-check on the
 * server with `requireRole`/`requirePermission`. A client gate only hides
 * controls; it cannot stop a crafted request.
 */
export function RoleGate({
  role,
  can: permission,
  allow,
  fallback = null,
  children,
}: {
  /** The current user's role. */
  role: Role;
  /** Require this permission (preferred — checks the permission matrix). */
  can?: Permission;
  /** Or require the role to be in this allow-list. */
  allow?: Role | Role[];
  /** Rendered when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const allowed =
    (permission === undefined || can(role, permission)) &&
    (allow === undefined || hasRole(role, allow));

  return <>{allowed ? children : fallback}</>;
}
