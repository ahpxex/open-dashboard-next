import { z } from "zod";

export const userRoles = ["admin", "member", "viewer"] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "invited", "suspended"] as const;
export type UserStatus = (typeof userStatuses)[number];

/**
 * An application user (taoracle account member). A memory-backed demo resource:
 * the row type is a plain `type` (not `interface`) so it satisfies the
 * `Record<string, unknown>` constraint of `memoryRepository`.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

/** Form / mutation input. No numeric fields, so one schema serves form + wire. */
export const userInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(userRoles),
  status: z.enum(userStatuses),
});
export type UserInput = z.infer<typeof userInputSchema>;

export const userUpdateSchema = userInputSchema.extend({
  id: z.string().min(1),
});
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  role: z.string().optional().default(""),
  status: z.string().optional().default(""),
});
export type UserListParams = z.infer<typeof userListParamsSchema>;
