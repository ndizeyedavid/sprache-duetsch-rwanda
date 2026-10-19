import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { createPaymentTx } from "../payments/payment-commands.js";
import { settleProblem } from "./claim-rules.js";
import type { SettleBalanceInput } from "./payment-claims.schema.js";

/**
 * "Mark as paid": one payment for exactly the student's outstanding balance, through the normal
 * manual-payment path (receipt, audit, balance recalculation). Refuses if the balance moved.
 */
export const settleBalance = (studentId: string, input: SettleBalanceInput, actorId: string) => transact(async (tx) => {
  const finance = await tx.studentFinance.findUnique({ where: { studentId } });
  if (!finance) throw notFound("This student has no finance profile yet");
  const balance = finance.balance.toNumber();
  const problem = settleProblem(balance, input.expectedBalance);
  if (problem) throw balance <= 0 ? badRequest(problem) : conflict(problem);
  return createPaymentTx(tx, {
    studentId, methodId: input.methodId, amount: balance, currency: finance.currency,
    reference: input.reference, paidAt: input.paidAt, notes: input.notes ?? "Marked as paid in full by finance",
  }, actorId);
});
