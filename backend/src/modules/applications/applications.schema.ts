import { z } from "zod";
import { idParam,optionalText,paginationQuery } from "../../lib/query.js";

export const applicationStatusEnum = z.enum(["NEW", "REVIEWING", "ACCEPTED", "WAITLISTED", "REJECTED", "ENROLLED", "WITHDRAWN"]);
export const applicationSourceEnum = z.enum(["WEBSITE", "CATALOG", "PORTAL", "WALK_IN"]);
export const applicationShiftEnum = z.enum(["MORNING", "AFTERNOON", "EVENING", "WEEKEND"]);

// Blank form values ("") mean "not chosen".
const optionalId = z.preprocess((value) => (value === "" || value === null ? undefined : value), z.string().trim().min(1).max(64).optional());
const nullableId = z.preprocess((value) => (value === "" ? null : value), z.string().trim().min(1).max(64).nullable().optional());

/** Public catalogue form. `website` is a honeypot: people never see it, bots fill it. */
export const createApplicationSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: optionalText(30),
  levelId: z.string().trim().min(1).max(64),
  intakeId: optionalId,
  campusId: optionalId,
  shift: z.preprocess((value) => (value === "" ? undefined : value), applicationShiftEnum.optional()),
  experience: optionalText(500),
  message: optionalText(2000),
  website: z.string().max(200).optional(),
});

export const listApplicationsQuerySchema = z.object({
  status: applicationStatusEnum.optional(),
  source: applicationSourceEnum.optional(),
  levelId: optionalId,
  intakeId: optionalId,
  campusId: optionalId,
  search: optionalText(120),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

export const waitlistQuerySchema = z.object({ levelId: optionalId, intakeId: optionalId });

export const transitionApplicationSchema = z.object({
  status: applicationStatusEnum,
  reason: optionalText(500),
});

/** Staff corrections before a decision, e.g. mapping a website course to a real level. */
export const updateApplicationSchema = z
  .object({
    levelId: nullableId,
    intakeId: nullableId,
    campusId: nullableId,
    shift: applicationShiftEnum.nullable().optional(),
    phone: z.union([z.string().trim().max(30), z.null()]).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), { message: "Change at least one field" });

export const createStudentFromApplicationSchema = z.object({
  enroll: z.boolean().optional(),
  classGroupId: optionalId,
  windowOverrideReason: z.string().trim().min(10).max(500).optional(),
});

export const applicationIdSchema = idParam;

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export type WaitlistQuery = z.infer<typeof waitlistQuerySchema>;
export type TransitionApplicationInput = z.infer<typeof transitionApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateStudentFromApplicationInput = z.infer<typeof createStudentFromApplicationSchema>;
