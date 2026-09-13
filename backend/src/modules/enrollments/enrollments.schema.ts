import { z } from "zod";
import { idParam, paginationQuery } from "../../lib/query.js";

export const enrollmentStatusEnum = z.enum(["ACTIVE", "COMPLETED", "WITHDRAWN", "DEFERRED"]);

export const listEnrollmentsQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  status: enrollmentStatusEnum.optional(),
  ...paginationQuery,
});

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  levelId: z.string().min(1),
  intakeId: z.string().min(1),
  campusId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  totalFee: z.coerce.number().min(0).optional(),
  currency: z.string().trim().min(1).max(10).optional(),
  discountTotal: z.coerce.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateEnrollmentSchema = z
  .object({
    classGroupId: z.string().min(1).nullable().optional(),
    status: enrollmentStatusEnum.optional(),
    totalFee: z.coerce.number().min(0).optional(),
    discountTotal: z.coerce.number().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const enrollmentIdSchema = idParam;

export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
