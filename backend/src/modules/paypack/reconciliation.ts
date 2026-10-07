import cron from "node-cron";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { paypackEnabled } from "./paypack-client.js";
import { refreshCheckout } from "./paypack.service.js";
import { processStoredEvents } from "./webhook-inbox.js";

let running = false;
export async function reconcilePendingPayments(): Promise<void> {
  if (running || !paypackEnabled()) return;
  running = true;
  try {
    await processStoredEvents();
    await prisma.paymentCheckout.updateMany({ where: { status: "INITIATING", createdAt: { lt: new Date(Date.now() - 120000) } },
      data: { status: "UNKNOWN" } });
    const pending = await prisma.paymentCheckout.findMany({ where: { status: { in: ["PENDING", "UNKNOWN"] },
      providerRef: { not: null } }, orderBy: { lastCheckedAt: { sort: "asc", nulls: "first" } }, take: 20 });
    for (const row of pending) {
      try { await refreshCheckout(row.id); }
      catch { logger.warn({ checkoutId: row.id }, "Paypack status check deferred"); }
    }
  } finally { running = false; }
}
export function startPaypackReconciliation() {
  if (!paypackEnabled()) return undefined;
  return cron.schedule("* * * * *", () => {
    void reconcilePendingPayments().catch(() => logger.error("Paypack reconciliation failed"));
  });
}
