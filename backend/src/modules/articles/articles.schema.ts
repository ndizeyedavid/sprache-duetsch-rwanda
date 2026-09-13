import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

const slugInput = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens")
  .optional();

export const createArticleSchema = z.object({
  slug: slugInput,
  title: z.string().trim().min(4).max(200),
  excerpt: optionalText(500),
  body: z.string().trim().min(10).max(20000),
  coverImageUrl: optionalText(700),
  isPublished: z.boolean().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listArticlesQuerySchema = z.object({
  search: optionalText(160),
  published: booleanQuery.optional(),
  ...paginationQuery,
});

export const createFaqSchema = z.object({
  question: z.string().trim().min(4).max(300),
  answer: z.string().trim().min(4).max(5000),
  order: z.coerce.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const updateFaqSchema = createFaqSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const articleIdSchema = idParam;
export const faqIdSchema = idParam;

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
