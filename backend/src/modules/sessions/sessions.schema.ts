import { safeSessionUrl, timezoneSchema } from "./session-policy.js";
import { z } from "zod";
import { idParam, optionalText, paginationQuery } from "../../lib/query.js";

export const sessionModeEnum = z.enum(["ONSITE", "ONLINE", "HYBRID"]);
export const meetingProviderEnum = z.enum(["GOOGLE_MEET", "ZOOM", "MICROSOFT_TEAMS", "OTHER"]);
export const sessionStatusEnum = z.enum([
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
]);
export const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);
export const materialTypeEnum = z.enum([
  "NOTE",
  "PDF",
  "VIDEO",
  "AUDIO",
  "LINK",
  "WORKSHEET",
  "SLIDE",
  "OTHER",
]);

export const createSessionSchema = z.object({
  classGroupId: z.string().min(1),
  title: z.string().trim().max(200).nullable().optional(),
  mode: sessionModeEnum,
  provider: meetingProviderEnum,
  meetingUrl: safeSessionUrl,
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  timezone: timezoneSchema,
  room: z.string().trim().max(120).nullable().optional(),
  teacherId: z.string().min(1).optional(),
  repeatWeeks: z.number().int().min(1).max(16).optional(),
  recordingUrl: safeSessionUrl,
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateSessionSchema = z
  .object({
    title: z.string().trim().max(200).nullable().optional(),
    mode: sessionModeEnum.optional(),
    provider: meetingProviderEnum.optional(),
    meetingUrl: safeSessionUrl,
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    timezone: timezoneSchema,
    room: z.string().trim().max(120).nullable().optional(),
    status: sessionStatusEnum.optional(),
    recordingUrl: safeSessionUrl,
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const listSessionsQuerySchema = z.object({
  classGroupId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  levelId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  status: sessionStatusEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

export const studentSessionsQuerySchema = z.object({ ...paginationQuery, scope: z.enum(["past", "all"]).optional() });

export const cancelSessionSchema = z.object({
  reason: optionalText(500),
});

export const rescheduleSessionSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  reason: optionalText(500),
});

export const createSessionMaterialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: materialTypeEnum,
  url: safeSessionUrl,
  description: optionalText(1000),
});

export const markAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        expectedUpdatedAt: z.coerce.date().nullable().optional(),
        status: attendanceStatusEnum,
        note: z.string().trim().max(500).nullable().optional(),
      }),
    )
    .min(1).max(500).refine(records => new Set(records.map(r => r.studentId)).size === records.length, "Each student must appear only once"),
});

export const updateAttendanceSchema = z
  .object({
    status: attendanceStatusEnum.optional(),
    note: z.string().trim().max(500).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const attendanceSummaryQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const sessionIdSchema = idParam;
export const materialIdSchema = z.object({ materialId: z.string().min(1) });
export const attendanceRecordIdSchema = idParam;

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type StudentSessionsQuery = z.infer<typeof studentSessionsQuerySchema>;
export type CancelSessionInput = z.infer<typeof cancelSessionSchema>;
export type RescheduleSessionInput = z.infer<typeof rescheduleSessionSchema>;
export type CreateSessionMaterialInput = z.infer<typeof createSessionMaterialSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type AttendanceSummaryQuery = z.infer<typeof attendanceSummaryQuerySchema>;
