import type { Prisma } from "../../generated/prisma/client.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { PAYMENT_EVENTS, webhookEventSchema, xendlyPaymentSchema } from "./mobile-money.schema.js";
import type { WebhookEvent } from "./mobile-money.schema.js";
import { GATEWAY_PROVIDER, settleCheckout } from "./settle-checkout.js";

/** Stores a verified payment event (deduplicated on the delivery id). Returns false for events we do not act on. */
export async function acceptWebhook(deliveryId: string, event: WebhookEvent): Promise<boolean> {
  if (!PAYMENT_EVENTS.has(event.type)) return false;
  const payment = xendlyPaymentSchema.parse(event.data);
  await prisma.paymentWebhookEvent.upsert({ where: { id: deliveryId }, update: {}, create: {
    id: deliveryId, provider: GATEWAY_PROVIDER, type: event.type, providerRef: payment.id,
    payload: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue,
  } });
  return true;
}

/** Applies a stored event once. Events for payments we never requested stay unprocessed and are ignored. */
export async function processEvent(deliveryId: string): Promise<void> {
  const stored = await prisma.paymentWebhookEvent.findUnique({ where: { id: deliveryId } });
  if (!stored || stored.processedAt) return;
  const payment = xendlyPaymentSchema.parse(webhookEventSchema.parse(stored.payload).data);
  const result = await settleCheckout(payment);
  if (result) await prisma.paymentWebhookEvent.update({ where: { id: stored.id }, data: { processedAt: new Date() } });
}

/** Replays events that arrived before their checkout was saved, or whose processing failed. */
export async function processStoredEvents(): Promise<void> {
  const events = await prisma.$queryRaw<{ id: string }[]>`
    SELECT e."id" FROM "PaymentWebhookEvent" e
    JOIN "PaymentCheckout" c ON c."providerRef" = e."providerRef" OR c."id" = (e."payload"->'data'->>'reference')
    WHERE e."provider" = ${GATEWAY_PROVIDER} AND e."processedAt" IS NULL AND c."provider" = ${GATEWAY_PROVIDER}
    ORDER BY e."createdAt" ASC LIMIT 100
  `;
  for (const event of events) {
    try { await processEvent(event.id); }
    catch (err) { logger.warn({ eventId: event.id, err }, "XendlyPay event needs reconciliation"); }
  }
}
