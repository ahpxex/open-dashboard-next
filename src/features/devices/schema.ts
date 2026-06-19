import { z } from "zod";

export const deviceStatuses = ["online", "degraded", "offline"] as const;
export type DeviceStatus = (typeof deviceStatuses)[number];

export type Device = {
  id: string;
  name: string;
  model: string;
  status: DeviceStatus;
  location: string;
  firmware: string;
  uptime: number;
  createdAt: Date;
  updatedAt: Date;
};

export const deviceListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20000).default(10000),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});
export type DeviceListParams = z.infer<typeof deviceListParamsSchema>;

export const allDevicesParams: DeviceListParams = {
  page: 1,
  pageSize: 10000,
  search: "",
  status: "",
};
