import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { logger } from "../../lib/logger.js";
import { drainEmailDeliveries } from "../../lib/notification-delivery.js";
import { notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { STAFF_ROLES } from "../../lib/roles.js";
import type { CreateAnnouncementInput } from "./notifications.schema.js";

// Resolve the recipient userIds for an announcement, then fan out one Notification
// row per recipient. Targeting fields are unioned and deduplicated.
export const createAnnouncement = async (input: CreateAnnouncementInput, actorId?: string) => {
  const target = input.target;
  const userIds = new Set<string>();

  const addStudents = async (where: Prisma.StudentWhereInput): Promise<void> => {
    const students = await prisma.student.findMany({ where, select: { userId: true } });
    for (const student of students) userIds.add(student.userId);
  };

  const hasTarget = Boolean(
    target &&
      (target.studentIds?.length ||
        target.classGroupId ||
        target.levelId ||
        target.intakeId ||
        target.campusId),
  );

  if (hasTarget && target) {
    if (target.studentIds && target.studentIds.length > 0) {
      await addStudents({ id: { in: target.studentIds } });
    }
    if (target.classGroupId) {
      await addStudents({
        enrollments: { some: { classGroupId: target.classGroupId, status: "ACTIVE" } },
      });
    }
    if (target.levelId) {
      await addStudents({
        enrollments: { some: { levelId: target.levelId, status: "ACTIVE" } },
      });
    }
    if (target.intakeId) {
      await addStudents({
        enrollments: { some: { intakeId: target.intakeId, status: "ACTIVE" } },
      });
    }
    if (target.campusId) {
      await addStudents({ campusId: target.campusId, status: "ACTIVE" });
    }
  } else if (input.audience === "STAFF") {
    const users = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    for (const user of users) userIds.add(user.id);
  } else if (input.audience === "ALL") {
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    for (const user of users) userIds.add(user.id);
  } else {
    await addStudents({ status: "ACTIVE" });
  }

  const recipients = [...userIds];
  const batchId = randomUUID();

  const sender = actorId ? await prisma.user.findUnique({ where: { id: actorId }, select: { firstName: true, lastName: true } }) : null;
  const from = sender ? `${sender.firstName} ${sender.lastName}` : "Deutsch Sprache RW";

  if (recipients.length > 0) {
    // Announcements are school notices: every member gets them in the app and by email.
    await notifyUsers(recipients, {
      type: input.type,
      title: input.title,
      body: input.body,
      data: { batchId, kind: "ANNOUNCEMENT", from },
      important: true,
      email: {
        action: { label: "Open Deutsch Sprache RW", url: env.PUBLIC_APP_URL },
        footnote: `Announcement from ${from}, Deutsch Sprache RW.`,
      },
    });
    // Start emailing now rather than at the next minute tick; the worker picks up anything left.
    void drainEmailDeliveries(recipients).catch((error) => logger.error({ error }, "Announcement email drain failed"));
  }

  await writeAudit({
    actorId: actorId ?? null,
    action: "ANNOUNCEMENT_SENT",
    entityType: "Notification",
    entityId: batchId,
    after: {
      audience: input.audience,
      type: input.type,
      channel: input.channel,
      target: target ?? null,
      recipientCount: recipients.length,
    },
  });

  return { recipientCount: recipients.length, emailed: recipients.length };
};
