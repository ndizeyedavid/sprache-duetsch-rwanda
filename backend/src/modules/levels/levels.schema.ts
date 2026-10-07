import { z } from "zod";
import { booleanQuery,idParam,optionalText,paginationQuery } from "../../lib/query.js";
import { completionRulesSchema } from "../certificates/completion-policy.js";

export const createLevelSchema = z.object({
  coursebookUrl: z.string().regex(/^\/api\/uploads\/[a-zA-Z0-9._-]+$/, "Upload a PDF and use its resource URL").nullable().optional(),
  coursebookPages: z.number().int().positive().nullable().optional(),
  completionRules: completionRulesSchema.optional(),
  code: z.string().trim().min(1).max(30).toUpperCase(),
  language: z.string().trim().min(2).max(60).default("German"),
  title: z.string().trim().min(2).max(160),
  levelLabel: z.string().trim().min(1).max(20),
  summary: optionalText(1000),
  objectives: z.array(z.string().trim().min(1).max(240)).optional(),
  order: z.coerce.number().int().optional(),
  defaultFee: z.coerce.number().min(0).optional(),
  currency: z.string().trim().min(1).max(10).default("RWF"),
  isActive: z.boolean().optional(),
});

export const updateLevelSchema = createLevelSchema.omit({ currency: true })
  .extend({ currency: z.string().trim().min(1).max(10).optional() }).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listLevelQuerySchema = z.object({
  search: optionalText(160),
  language: optionalText(60),
  isActive: booleanQuery.optional(),
  ...paginationQuery,
});

export const levelIdSchema = idParam;

export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;
export type ListLevelQuery = z.infer<typeof listLevelQuerySchema>;
