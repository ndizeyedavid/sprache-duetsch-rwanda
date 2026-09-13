import cron from "node-cron";
import { env, isTest } from "../config/env.js";
import { runPaymentReminders } from "../modules/payments/payments.service.js";
import { logger } from "./logger.js";
import { notifyUsers } from "./notify.js";
import { prisma } from "./prisma.js";

const PRE_CLASS_WINDOW_HOURS = 24;
const DEDUPE_WINDOW_HOURS = 24;

/** Notify enrolled students about SCHEDULED sessions starting within 24h (once per session). */
export const runPreClassReminders = async (): Promise<number> => {
  const now = new Date();
  const horizon = new Date(now.getTime() + PRE_CLASS_WINDOW_HOURS * 3_600_000);
  const cutoff = new Date(now.getTime() - DEDUPE_WINDOW_HOURS * 3_600_000);

  const sessions = await prisma.classSession.findMany({
    where: { status: "SCHEDULED", startAt: { gt: now, lte: horizon } },
    select: { id: true, title: true, startAt: true, classGroupId: true },
  });

  let sent = 0;
  for (const session of sessions) {
    const already = await prisma.notification.findFirst({
      where: {
        AND: [
          { data: { path: ["kind"], equals: "pre-class-reminder" } },
          { data: { path: ["sessionId"], equals: session.id } },
          { createdAt: { gte: cutoff } },
        ],
      },
      select: { id: true },
    });
    if (already) {
      continue;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { classGroupId: session.classGroupId, status: "ACTIVE" },
      select: { student: { select: { userId: true } } },
    });
    const userIds = [...new Set(enrollments.map((enrollment) => enrollment.student.userId))];
    if (userIds.length === 0) {
      continue;
    }

    const result = await notifyUsers(userIds, {
      type: "SCHEDULE",
      title: `Reminder: ${session.title}`,
      body: `Your live class starts at ${session.startAt.toISOString()}. Open your schedule to join.`,
      data: { kind: "pre-class-reminder", sessionId: session.id },
    });
    sent += result.count;
  }

  return sent;
};

export const startReminderJobs = (): void => {
  if (env.REMINDERS_ENABLED !== "true" || isTest) {
    logger.info("Reminder scheduler disabled");
    return;
  }

  // Overdue balances every morning; pre-class reminders every hour.
  cron.schedule(
    "0 8 * * *",
    () => {
      runPaymentReminders({ overdueOnly: true })
        .then((result) => logger.info({ sent: result.sent }, "Overdue payment reminders sent"))
        .catch((error: unknown) => logger.error({ err: error }, "Overdue reminder job failed"));
    },
    { timezone: env.REMINDER_TIMEZONE },
  );

  cron.schedule(
    "15 * * * *",
    () => {
      runPreClassReminders()
        .then((sent) => logger.info({ sent }, "Pre-class reminders sent"))
        .catch((error: unknown) => logger.error({ err: error }, "Pre-class reminder job failed"));
    },
    { timezone: env.REMINDER_TIMEZONE },
  );

  logger.info(
    { timezone: env.REMINDER_TIMEZONE },
    "Reminder scheduler started (overdue daily, pre-class hourly)",
  );
};
