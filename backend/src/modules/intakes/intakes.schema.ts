import { z } from "zod";
import { booleanQuery,idParam,nullableDate,optionalText,paginationQuery } from "../../lib/query.js";

const currencySchema = z.string().trim().min(1).max(10);

/**
 * Shared fields. `currency` deliberately has no default here: in Zod 4 a
 * `.default()` survives `.partial()`, so a default on this object would make
 * every PATCH reset the stored currency to RWF.
 */
const intakeFields = {
  code: z.string().trim().min(1).max(30).toUpperCase(),
  name: z.string().trim().min(2).max(120),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  enrollmentOpensAt: nullableDate,
  enrollmentEndsAt: nullableDate,
  registrationFee: z.coerce.number().min(0).optional(),
  bookFee: z.coerce.number().min(0).optional(),
  currency: currencySchema,
  isActive: z.boolean().optional(),
};

export const createIntakeSchema = z
  .object({ ...intakeFields, currency: currencySchema.default("RWF") })
  .refine((value) => value.endDate.getTime() > value.startDate.getTime(), {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const updateIntakeSchema = z
  .object(intakeFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

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
