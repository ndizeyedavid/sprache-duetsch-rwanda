import { z } from "zod";

// Shared query-building blocks so every module validates list/pagination input the
// same way and query-string booleans ("true"/"false"/"1"/"0") are parsed correctly.

export const paginationQuery = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
};

export const booleanQuery = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

export const optionalText = (max = 240) => z.string().trim().max(max).optional();

export const idParam = z.object({ id: z.string().min(1) });
