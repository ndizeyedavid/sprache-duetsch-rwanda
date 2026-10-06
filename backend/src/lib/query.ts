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

export const optionalText = (max = 240) =>
  z
    .union([z.string().trim().max(max), z.null(), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined));

export const idParam = z.object({ id: z.string().min(1) });

/**
 * A nullable timestamp for optional columns. Blank strings and `null` resolve to
 * `null` ("not set") instead of being coerced: `z.coerce.date()` runs
 * `new Date(null)`, which quietly yields 1970-01-01 rather than failing.
 */
export const nullableDate = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.date().nullable().optional(),
);

/** Optional editable text: null or blank clears the stored value. */
export const nullableText = (max = 240) =>
  z.union([z.string().trim().max(max), z.null()]).optional()
    .transform((value) => value === undefined ? undefined : value || null);
