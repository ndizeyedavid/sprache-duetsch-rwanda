import { Prisma } from "../../generated/prisma/client.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { transact } from "../../lib/transactions.js";
import { resolveStudentId } from "../payments/resolve-student-id.js";
import { assertPaypackEnabled, findTransaction, requestCashin } from "./paypack-client.js";
import type { CheckoutInput } from "./paypack.schema.js";
import { processStoredEvents } from "./webhook-inbox.js";
import { settleCheckout } from "./settle-checkout.js";

export async function startCheckout(userId: string, input: CheckoutInput) {
  assertPaypackEnabled();
  const studentId = await resolveStudentId(userId);
  const { checkout, created } = await transact(async tx => {
    const previous = await tx.paymentCheckout.findUnique({ where: { requestKey: input.requestKey } });
    if (previous) {
      if (previous.studentId !== studentId || previous.phone !== input.phone || !previous.amount.equals(input.amount)) {
        throw conflict("This payment request was already used with different details");
      }
      return { checkout: previous, created: false };
    }
    const unresolved = await tx.paymentCheckout.findFirst({ where: { studentId, status: { in: ["INITIATING", "PENDING", "UNKNOWN"] } } });
    if (unresolved) throw conflict("You already have a payment awaiting confirmation. Check its status before paying again.");
    const finance = await recalculateStudentFinance(tx, studentId);
    if (finance.currency !== "RWF") throw badRequest("Paypack supports RWF payments only");
    if (new Prisma.Decimal(input.amount).greaterThan(finance.balance)) throw badRequest("Amount exceeds your outstanding balance");
    const method = await tx.paymentMethodConfig.findUnique({ where: { code: "PAYPACK" } });
    if (method && !method.isActive) throw badRequest("Online payments have been disabled by finance");
    const checkout = await tx.paymentCheckout.create({ data: { studentId, ...input, amount: new Prisma.Decimal(input.amount) } });
    return { checkout, created: true };
  });
  if (!created) return checkout;
  try {
    const response = await requestCashin(input.amount, input.phone, input.requestKey);
    if (!checkout.amount.equals(response.amount)) throw badRequest("Unexpected amount returned by payment provider");
    await prisma.paymentCheckout.update({ where: { id: checkout.id }, data: { providerRef: response.ref, status: "PENDING" } });
  } catch {
    // A network error does not prove that Paypack rejected the charge. Never send a new cashin automatically.
    return prisma.paymentCheckout.update({ where: { id: checkout.id }, data: { status: "UNKNOWN" } });
  }
  await processStoredEvents();
  return prisma.paymentCheckout.findUniqueOrThrow({ where: { id: checkout.id } });
}
export async function refreshCheckout(id: string, studentId?: string) {
  const checkout = await prisma.paymentCheckout.findUnique({ where: { id } });
  if (!checkout || studentId && checkout.studentId !== studentId) throw notFound("Payment request not found");
  if (checkout.providerRef && ["PENDING", "UNKNOWN"].includes(checkout.status) &&
    (!checkout.lastCheckedAt || Date.now() - checkout.lastCheckedAt.getTime() > 15000)) {
    const claimed = await prisma.paymentCheckout.updateMany({ where: { id, lastCheckedAt: checkout.lastCheckedAt }, data: { lastCheckedAt: new Date() } });
    if (!claimed.count) return prisma.paymentCheckout.findUniqueOrThrow({ where: { id } });
    const transaction = await findTransaction(checkout.providerRef);
    if (transaction) await settleCheckout(transaction);
  }
  return prisma.paymentCheckout.findUniqueOrThrow({ where: { id } });
}
export async function listMyCheckouts(userId: string) {
  const studentId = await resolveStudentId(userId);
  return prisma.paymentCheckout.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 });
}
