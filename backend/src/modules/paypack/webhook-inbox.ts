import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { eventSchema } from "./paypack.schema.js";
import { settleCheckout } from "./settle-checkout.js";

export async function acceptWebhook(payload: unknown): Promise<void> {
  const event = eventSchema.parse(payload);
  await prisma.paypackEvent.upsert({ where: { id: event.event_id }, update: {},
    create: { id: event.event_id, providerRef: event.data.ref, payload: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue } });
  const stored = await prisma.paypackEvent.findUniqueOrThrow({ where: { id: event.event_id } });
  if (stored.processedAt) return;
  const original = eventSchema.parse(stored.payload);
  const result = await settleCheckout(original.data);
  if (result) await prisma.paypackEvent.update({ where: { id: stored.id }, data: { processedAt: new Date() } });
}
export async function processStoredEvents(): Promise<void> {
  const events = await prisma.$queryRaw<{ id: string; payload: Prisma.JsonValue }[]>`
    SELECT e."id", e."payload" FROM "PaypackEvent" e
    JOIN "PaymentCheckout" c ON c."providerRef" = e."providerRef"
    WHERE e."processedAt" IS NULL ORDER BY e."createdAt" ASC LIMIT 100
  `;
  for (const event of events) {
    try { await acceptWebhook(event.payload); }
    catch { logger.warn({ eventId: event.id }, "Paypack event needs reconciliation"); }
  }
}
