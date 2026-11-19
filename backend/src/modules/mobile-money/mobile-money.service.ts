import { env } from "../../config/env.js";
import { Prisma } from "../../generated/prisma/client.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { AppError, badRequest, conflict, notFound } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { transact } from "../../lib/transactions.js";
import { resolveStudentId } from "../payments/resolve-student-id.js";
import type { CheckoutInput } from "./mobile-money.schema.js";
import { GATEWAY_METHOD_CODE, GATEWAY_PROVIDER, settleCheckout } from "./settle-checkout.js";
import { processStoredEvents } from "./webhook-inbox.js";
import { assertXendlyEnabled, createXendlyPayment, GatewayRefusal, xendlyAppMode, xendlyEnabled } from "./xendly-client.js";
import { refusalError } from "./gateway-errors.js";

export const MOBILE_MONEY_MINIMUM = 100;
export const UNRESOLVED = ["INITIATING", "PENDING", "UNKNOWN"] as const;

export async function mobileMoneyAvailable(): Promise<boolean> {
  const method = await prisma.paymentMethodConfig.findUnique({ where: { code: GATEWAY_METHOD_CODE } });
  return xendlyEnabled() && method?.isActive !== false;
}
export const mobileMoneyConfig = async () => ({
  enabled: await mobileMoneyAvailable(), minimumAmount: MOBILE_MONEY_MINIMUM, currency: "RWF",
  // In test mode only numbers on the XendlyPay test list can pay; the page says so.
  testMode: env.XENDLYPAY_MODE === "test",
});

/** Refuse before anyone is prompted if the XendlyPay app is not in the mode this deployment credits. */
async function assertGatewayMode(): Promise<void> {
  let mode: "test" | "live";
  try { mode = await xendlyAppMode(); }
  catch (error) {
    if (error instanceof GatewayRefusal) throw refusalError(error);
    throw new AppError(503, "Online payments are temporarily unavailable. Please try again in a moment.");
  }
  if (mode !== env.XENDLYPAY_MODE) {
    logger.error({ appMode: mode, expected: env.XENDLYPAY_MODE }, "XendlyPay app mode does not match XENDLYPAY_MODE");
    throw new AppError(503, "Online payments are being set up. Please pay through the finance office for now.");
  }
}

export async function startCheckout(userId: string, input: CheckoutInput) {
  return startStudentCheckout(await resolveStudentId(userId), input);
}

export async function startStudentCheckout(studentId: string, input: CheckoutInput) {
  assertXendlyEnabled();
  const previous = await prisma.paymentCheckout.findUnique({ where: { requestKey: input.requestKey } });
  if (!previous) await assertGatewayMode();
  const { checkout, created } = await transact(async tx => {
    const existing = await tx.paymentCheckout.findUnique({ where: { requestKey: input.requestKey } });
    if (existing) {
      if (existing.studentId !== studentId || existing.phone !== input.phone || !existing.amount.equals(input.amount)) {
        throw conflict("This payment request was already used with different details");
      }
      return { checkout: existing, created: false };
    }
    const unresolved = await tx.paymentCheckout.findFirst({ where: { studentId, provider: GATEWAY_PROVIDER, status: { in: [...UNRESOLVED] } } });
    if (unresolved) throw conflict("You already have a payment awaiting confirmation. Check its status before paying again.");
    const finance = await recalculateStudentFinance(tx, studentId);
    if (finance.currency !== "RWF") throw badRequest("Mobile money supports RWF payments only");
    if (new Prisma.Decimal(input.amount).greaterThan(finance.balance)) throw badRequest("Amount exceeds your outstanding balance");
    const method = await tx.paymentMethodConfig.findUnique({ where: { code: GATEWAY_METHOD_CODE } });
    if (method && !method.isActive) throw badRequest("Online payments have been disabled by finance");
    const row = await tx.paymentCheckout.create({ data: { studentId, ...input, provider: GATEWAY_PROVIDER, amount: new Prisma.Decimal(input.amount) } });
    return { checkout: row, created: true };
  });
  if (!created) return checkout;
  return sendToGateway(checkout);
}

async function sendToGateway(checkout: { id: string; amount: Prisma.Decimal; phone: string }) {
  try {
    const payment = await createXendlyPayment({ checkoutId: checkout.id, amount: checkout.amount.toNumber(),
      phone: checkout.phone, description: `Tuition payment ${checkout.id.slice(0, 8)}` });
    // A webhook may already have settled this request (it finds it by reference), so only move it forward.
    await prisma.paymentCheckout.updateMany({ where: { id: checkout.id, providerRef: null }, data: { providerRef: payment.id } });
    await prisma.paymentCheckout.updateMany({ where: { id: checkout.id, status: { in: ["INITIATING", "UNKNOWN"] } }, data: { status: "PENDING" } });
    if (payment.status !== "pending") await settleCheckout(payment);
  } catch (error) {
    if (error instanceof GatewayRefusal) {
      // XendlyPay refused outright (bad number, limit, not a test number...): no prompt was sent, nothing was charged.
      await prisma.paymentCheckout.update({ where: { id: checkout.id }, data: { status: "FAILED", failureReason: error.message } });
      throw refusalError(error);
    }
    // No answer does not prove no payment. Never resend blindly; the reconciler looks it up by reference.
    logger.warn({ checkoutId: checkout.id, err: error }, "XendlyPay outcome unknown; reconciling by reference");
    return prisma.paymentCheckout.update({ where: { id: checkout.id }, data: { status: "UNKNOWN" } });
  }
  await processStoredEvents();
  return prisma.paymentCheckout.findUniqueOrThrow({ where: { id: checkout.id } });
}

export async function listMyCheckouts(userId: string) {
  const studentId = await resolveStudentId(userId);
  return prisma.paymentCheckout.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 });
}

export async function getCheckoutFor(id: string, studentId?: string) {
  const checkout = await prisma.paymentCheckout.findUnique({ where: { id } });
  if (!checkout || studentId && checkout.studentId !== studentId) throw notFound("Payment request not found");
  return checkout;
}
