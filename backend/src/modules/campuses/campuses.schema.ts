import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const createCampusSchema = z.object({
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(120),
  address: optionalText(240),
  phone: optionalText(30),
  email: z.string().trim().email().max(160).optional(),
  isActive: z.boolean().optional(),
});

export const updateCampusSchema = createCampusSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listCampusQuerySchema = z.object({
  search: optionalText(120),
  isActive: booleanQuery.optional(),
  ...paginationQuery,
});

export const campusIdSchema = idParam;

export type CreateCampusInput = z.infer<typeof createCampusSchema>;
export type UpdateCampusInput = z.infer<typeof updateCampusSchema>;
export type ListCampusQuery = z.infer<typeof listCampusQuerySchema>;
