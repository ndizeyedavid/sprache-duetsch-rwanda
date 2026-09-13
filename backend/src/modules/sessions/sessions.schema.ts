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
  title: optionalText(200),
  mode: sessionModeEnum,
  provider: meetingProviderEnum,
  meetingUrl: optionalText(1000),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  timezone: optionalText(64),
  room: optionalText(120),
  teacherId: z.string().min(1).optional(),
  recordingUrl: optionalText(1000),
  notes: optionalText(2000),
});

export const updateSessionSchema = z
  .object({
    title: optionalText(200),
    mode: sessionModeEnum.optional(),
    provider: meetingProviderEnum.optional(),
    meetingUrl: optionalText(1000),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    timezone: optionalText(64),
    room: optionalText(120),
    status: sessionStatusEnum.optional(),
    recordingUrl: optionalText(1000),
    notes: optionalText(2000),
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

export const studentSessionsQuerySchema = z.object({ ...paginationQuery });

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
  url: optionalText(1000),
  description: optionalText(1000),
});

export const markAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: attendanceStatusEnum,
        note: optionalText(500),
      }),
    )
    .min(1),
});

export const updateAttendanceSchema = z
  .object({
    status: attendanceStatusEnum.optional(),
    note: optionalText(500),
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
export const materialIdSchema = idParam;
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
