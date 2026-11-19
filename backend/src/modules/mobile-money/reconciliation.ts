import cron from "node-cron";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { refreshCheckout } from "./refresh-checkout.js";
import { GATEWAY_PROVIDER } from "./settle-checkout.js";
import { processStoredEvents } from "./webhook-inbox.js";
import { xendlyEnabled } from "./xendly-client.js";

let running = false;
/** Webhooks are the fast path; this minute job makes sure every request still reaches a final status without them. */
export async function reconcilePendingPayments(): Promise<void> {
  if (running || !xendlyEnabled()) return;
  running = true;
  try {
    await processStoredEvents();
    await prisma.paymentCheckout.updateMany({ where: { provider: GATEWAY_PROVIDER, status: "INITIATING", createdAt: { lt: new Date(Date.now() - 120000) } },
      data: { status: "UNKNOWN" } });
    const open = await prisma.paymentCheckout.findMany({ where: { provider: GATEWAY_PROVIDER, status: { in: ["PENDING", "UNKNOWN"] } },
      orderBy: { lastCheckedAt: { sort: "asc", nulls: "first" } }, take: 20 });
    for (const row of open) {
      try { await refreshCheckout(row.id); }
      catch { logger.warn({ checkoutId: row.id }, "XendlyPay status check deferred"); }
    }
  } finally { running = false; }
}
export function startMobileMoneyReconciliation() {
  if (!xendlyEnabled()) return undefined;
  return cron.schedule("* * * * *", () => {
    void reconcilePendingPayments().catch((err: unknown) => logger.error({ err }, "XendlyPay reconciliation failed"));
  });
}
