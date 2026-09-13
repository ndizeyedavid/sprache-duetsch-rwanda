import { z } from "zod";
import { booleanQuery, idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const shiftEnum = z.enum(["MORNING", "AFTERNOON", "EVENING", "WEEKEND"]);

export const createClassSchema = z.object({
  code: z.string().trim().min(1).max(30).toUpperCase(),
  name: z.string().trim().min(2).max(160),
  levelId: z.string().min(1),
  intakeId: z.string().min(1),
  campusId: z.string().min(1),
  teacherId: z.string().min(1).optional(),
  shift: shiftEnum.default("EVENING"),
  capacity: z.coerce.number().int().positive().optional(),
  room: optionalText(60),
  isActive: z.boolean().optional(),
});

export const updateClassSchema = createClassSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const listClassQuerySchema = z.object({
  levelId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  shift: shiftEnum.optional(),
  isActive: booleanQuery.optional(),
  search: optionalText(160),
  ...paginationQuery,
});

export const classIdSchema = idParam;

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ListClassQuery = z.infer<typeof listClassQuerySchema>;
