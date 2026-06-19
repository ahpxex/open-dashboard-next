import { z } from "zod";

export const redemptionCodeStatuses = ["active", "paused", "expired"] as const;
export type RedemptionCodeStatus = (typeof redemptionCodeStatuses)[number];

export type RedemptionCode = {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  status: RedemptionCodeStatus;
  createdAt: Date;
  updatedAt: Date;
};

/** Coercing schema parsed on the wire (numbers may arrive as strings). */
export const redemptionCodeInputSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discountPercent: z.coerce.number().int().min(0, "0–100").max(100, "0–100"),
  maxUses: z.coerce.number().int().min(1, "Must be ≥ 1"),
  status: z.enum(redemptionCodeStatuses),
});
export type RedemptionCodeInput = z.infer<typeof redemptionCodeInputSchema>;

/** Non-coercing form validator (numeric inputs stay numbers). */
export const redemptionCodeFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discountPercent: z
    .number({ message: "Required" })
    .int()
    .min(0, "0–100")
    .max(100, "0–100"),
  maxUses: z.number({ message: "Required" }).int().min(1, "Must be ≥ 1"),
  status: z.enum(redemptionCodeStatuses),
});

/** Create payload the repository stores (adds the system-managed usedCount). */
export type NewRedemptionCode = RedemptionCodeInput & { usedCount: number };

/** Partial update — inline cell edits send only the changed field. */
export const redemptionCodeUpdateSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(3).optional(),
  discountPercent: z.coerce.number().int().min(0).max(100).optional(),
  maxUses: z.coerce.number().int().min(0).optional(),
  status: z.enum(redemptionCodeStatuses).optional(),
});
export type RedemptionCodeUpdate = z.infer<typeof redemptionCodeUpdateSchema>;

export const redemptionCodeListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});
export type RedemptionCodeListParams = z.infer<
  typeof redemptionCodeListParamsSchema
>;

export const allCodesParams: RedemptionCodeListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  status: "",
};
