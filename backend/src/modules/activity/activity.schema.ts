import { z } from "zod";
import { idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const activityTypeEnum = z.enum([
  "ANNOUNCEMENT",
  "LESSON",
  "ASSIGNMENT",
  "EXAM",
  "PAYMENT",
  "CLASS",
  "SCHEDULE",
  "ATTENDANCE",
  "ENROLLMENT",
  "MESSAGE",
  "SYSTEM",
]);

export const createEventSchema = z.object({
  type: activityTypeEnum.default("ANNOUNCEMENT"),
  title: z.string().trim().min(2).max(200),
  body: optionalText(2000),
  levelId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

export const listFeedQuerySchema = z.object({
  type: activityTypeEnum.optional(),
  levelId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  ...paginationQuery,
});

export const eventIdSchema = idParam;

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ListFeedQuery = z.infer<typeof listFeedQuerySchema>;
