import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

const intakeBaseSchema = z.object({
  code: z.string().trim().min(1).max(30).toUpperCase(),
  name: z.string().trim().min(2).max(120),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  enrollmentOpensAt: z.coerce.date().optional(),
  enrollmentEndsAt: z.coerce.date().optional(),
  registrationFee: z.coerce.number().min(0).optional(),
  bookFee: z.coerce.number().min(0).optional(),
  currency: z.string().trim().min(1).max(10).default("RWF"),
  isActive: z.boolean().optional(),
});

export const createIntakeSchema = intakeBaseSchema.refine(
  (value) => value.endDate.getTime() > value.startDate.getTime(),
  { message: "endDate must be after startDate", path: ["endDate"] },
);

export const updateIntakeSchema = intakeBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listIntakeQuerySchema = z.object({
  search: optionalText(160),
  isActive: booleanQuery.optional(),
  upcoming: booleanQuery.optional(),
  ...paginationQuery,
});

export const intakeIdSchema = idParam;

export type CreateIntakeInput = z.infer<typeof createIntakeSchema>;
export type UpdateIntakeInput = z.infer<typeof updateIntakeSchema>;
export type ListIntakeQuery = z.infer<typeof listIntakeQuerySchema>;
