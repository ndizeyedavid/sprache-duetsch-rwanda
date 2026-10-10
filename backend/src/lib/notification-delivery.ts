import { writeAuditTx } from "./audit.js";
import { badRequest, notFound } from "./http-error.js";
import { env,smtpEnabled } from "../config/env.js";
import type { Prisma } from "../generated/prisma/client.js";
import { logger } from "./logger.js";
import { sendMail } from "./mailer.js";
import { prisma } from "./prisma.js";
import { transact } from "./transactions.js";

export interface DeliveryMail { subject: string; text: string; html: string }
export const emailAvailable = () => smtpEnabled || Boolean(env.EMAIL_RELAY_URL);

export async function queueTransactionalEmail(userId: string, email: string, mail: DeliveryMail, eventKey: string, expiresAt?: Date) {
  return prisma.notificationDelivery.upsert({ where: { eventKey }, update: {}, create: {
    userId, email, eventKey, payload: { mail, expiresAt: expiresAt?.toISOString() ?? null } as unknown as Prisma.InputJsonValue,
  } });
}

/** Claim each delivery once. Recover claims abandoned by a crashed process. */
export async function dispatchEmailDeliveries(deliver: typeof sendMail = sendMail, userIds?: string[]): Promise<number> {
  if (deliver === sendMail && !emailAvailable()) { logger.warn("Email delivery is unavailable: configure SMTP or HTTPS relay"); return 0; }
  const now = new Date();
  const scope = userIds ? { userId: { in: userIds } } : {};
  await prisma.notificationDelivery.updateMany({ where: { ...scope, status: "SENDING", nextAttemptAt: { lt: now } }, data: { status: "PENDING" } });
  const rows = await prisma.notificationDelivery.findMany({ where: { ...scope, status: "PENDING", nextAttemptAt: { lte: now } }, orderBy: { createdAt: "asc" }, take: 25 });
  let sent = 0;
  for (const row of rows) {
    const claimed = await prisma.notificationDelivery.updateMany({ where: { id: row.id, status: "PENDING", nextAttemptAt: { lte: now } },
      data: { status: "SENDING", attempts: { increment: 1 }, nextAttemptAt: new Date(Date.now() + 300000) } });
    if (!claimed.count) continue;
    const payload = row.payload as unknown as { mail: DeliveryMail; expiresAt?: string | null };
    if (payload.expiresAt && new Date(payload.expiresAt) <= new Date()) {
      await prisma.notificationDelivery.update({ where: { id: row.id }, data: { status: "FAILED", lastError: "Recovery link expired; request a new password reset", payload: {} } });
      continue;
    }
    try {
      await deliver({ to: row.email, ...payload.mail });
      await prisma.notificationDelivery.update({ where: { id: row.id }, data: { status: "SENT", sentAt: new Date(), lastError: null, payload: {} } });
      sent++;
    } catch (error) {
      await prisma.notificationDelivery.update({ where: { id: row.id }, data: {
        status: row.attempts >= 4 ? "FAILED" : "PENDING",
        lastError: error instanceof Error ? error.message.slice(0, 500) : "Delivery failed",
        nextAttemptAt: new Date(Date.now() + Math.min(3600000, 60000 * 2 ** row.attempts)),
      } });
    }
  }
  return sent;
}

export async function enqueueNotification(tx: Prisma.TransactionClient, input: {
  userId: string; email: string; eventKey?: string; mail?: DeliveryMail; notification?: Prisma.NotificationCreateManyInput;
}) {
  const eventKey = input.eventKey ?? null;
  if (eventKey && await tx.notificationDelivery.findUnique({ where: { eventKey } })) return false;
  await tx.notificationDelivery.create({ data: { userId: input.userId, email: input.email, eventKey,
    status: input.mail ? "PENDING" : "SKIPPED", payload: { mail: input.mail ?? null } as Prisma.InputJsonValue } });
  if (input.notification) await tx.notification.create({ data: input.notification });
  return true;
}

export const retryDelivery = (id: string, actorId?: string) => transact(async tx => {
  const before = await tx.notificationDelivery.findUnique({ where: { id } });
  if (!before) throw notFound("Delivery not found");
  if (before.status !== "FAILED") throw badRequest("Only failed deliveries can be retried manually");
  if (!before.payload || typeof before.payload !== "object" || !("mail" in before.payload)) throw badRequest("Delivery expired; request a new message");
  const row = await tx.notificationDelivery.update({ where: { id }, data: {
    status: "PENDING", attempts: 0, nextAttemptAt: new Date(), lastError: null,
  } });
  await writeAuditTx(tx, { actorId, action: "NOTIFICATION_RETRIED", entityType: "NotificationDelivery", entityId: id,
    before: { status: before.status, attempts: before.attempts }, after: { status: row.status } });
  return row;
});
