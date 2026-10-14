import { z } from "zod";
import { paginationQuery } from "../../lib/query.js";

const optionalId = z.string().min(1).optional();

export const atRiskQuerySchema = z.object({
  classGroupId: optionalId,
  levelId: optionalId,
  intakeId: optionalId,
  campusId: optionalId,
  riskLevel: z.enum(["HIGH", "MEDIUM"]).optional(),
  /** No lesson progress, activity, attempt or homework for this many days counts as inactive. */
  inactivityDays: z.coerce.number().int().min(3).max(120).default(14),
  ...paginationQuery,
});

export const retentionQuerySchema = z.object({
  intakeId: optionalId,
  levelId: optionalId,
  campusId: optionalId,
  /** Window for the recent-withdrawals list. */
  recentDays: z.coerce.number().int().min(1).max(365).default(90),
});

export const gradingBacklogQuerySchema = z.object({ teacherId: optionalId });

export type AtRiskQuery = z.infer<typeof atRiskQuerySchema>;
export type RetentionQuery = z.infer<typeof retentionQuerySchema>;
export type GradingBacklogQuery = z.infer<typeof gradingBacklogQuerySchema>;
