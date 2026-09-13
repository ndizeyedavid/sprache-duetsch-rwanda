import { z } from "zod";
import { booleanQuery, idParam, paginationQuery } from "../../lib/query.js";

export const notificationTypeEnum = z.enum([
  "ANNOUNCEMENT",
  "LESSON",
  "ASSIGNMENT",
  "EXAM",
  "PAYMENT",
  "CLASS",
  "SCHEDULE",
  "MESSAGE",
  "SYSTEM",
]);

export const notificationChannelEnum = z.enum([
  "IN_APP",
  "EMAIL",
  "SMS",
  "WHATSAPP",
  "PUSH",
]);

export const announcementAudienceEnum = z.enum(["STUDENTS", "STAFF", "ALL"]);

export const listNotificationQuerySchema = z.object({
  unread: booleanQuery.optional(),
  type: notificationTypeEnum.optional(),
  ...paginationQuery,
});

export const announcementTargetSchema = z.object({
  levelId: z.string().min(1).optional(),
  intakeId: z.string().min(1).optional(),
  campusId: z.string().min(1).optional(),
  classGroupId: z.string().min(1).optional(),
  studentIds: z.array(z.string().min(1)).optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  type: notificationTypeEnum.default("ANNOUNCEMENT"),
  channel: notificationChannelEnum.default("IN_APP"),
  audience: announcementAudienceEnum.default("STUDENTS"),
  target: announcementTargetSchema.optional(),
});

export const notificationIdSchema = idParam;

export type ListNotificationQuery = z.infer<typeof listNotificationQuerySchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
