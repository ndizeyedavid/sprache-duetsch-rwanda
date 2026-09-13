import { z } from "zod";
import { idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const accountStatusEnum = z.enum([
  "ACTIVE",
  "PENDING",
  "SUSPENDED",
  "COMPLETED",
  "WITHDRAWN",
  "GRADUATED",
]);

export const studentShiftEnum = z.enum(["MORNING", "AFTERNOON", "EVENING", "WEEKEND"]);

export const listStudentsQuerySchema = z.object({
  campusId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  currentLevelId: z.string().min(1).optional(),
  status: accountStatusEnum.optional(),
  shift: studentShiftEnum.optional(),
  search: optionalText(120),
  ...paginationQuery,
});

export const updateStudentSchema = z
  .object({
    campusId: z.string().min(1).optional(),
    intakeId: z.string().min(1).optional(),
    intendedLevelId: z.string().min(1).optional(),
    currentLevelId: z.string().min(1).optional(),
    shift: studentShiftEnum.optional(),
    status: accountStatusEnum.optional(),
    gender: optionalText(30),
    nationalId: optionalText(40),
    address: optionalText(240),
    guardianName: optionalText(120),
    guardianPhone: optionalText(30),
    dateOfBirth: z.string().datetime().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const placementSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  recommendedLevelId: z.string().uuid().optional(),
  note: optionalText(500),
});

export const studentIdSchema = idParam;

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type PlacementInput = z.infer<typeof placementSchema>;
