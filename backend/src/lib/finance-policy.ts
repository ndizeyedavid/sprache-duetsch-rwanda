import { Prisma } from "../generated/prisma/client.js";
import { badRequest } from "./http-error.js";

const ZERO = new Prisma.Decimal(0);
interface Obligation { id: string; amount: Prisma.Decimal; dueDate: Date | null; createdAt: Date }

/** Oldest due obligations are covered first; undated charges are due immediately. */
export function allocateObligations(charges: Obligation[], credit: Prisma.Decimal, now = new Date()) {
  let available = Prisma.Decimal.max(ZERO, credit);
  const obligations = [...charges].sort((a, b) =>
    (a.dueDate ?? a.createdAt).getTime() - (b.dueDate ?? b.createdAt).getTime());
  const rows = obligations.map(charge => {
    const applied = Prisma.Decimal.min(available, charge.amount);
    available = available.minus(applied);
    const outstanding = charge.amount.minus(applied);
    const dueAt = charge.dueDate ?? charge.createdAt;
    return { ...charge, outstanding, dueAt, overdue: dueAt < now && outstanding.greaterThan(ZERO) };
  });
  const overdueAmount = rows.filter(row => row.overdue).reduce((sum, row) => sum.plus(row.outstanding), ZERO);
  const next = rows.find(row => row.outstanding.greaterThan(ZERO) && !row.overdue);
  return { obligations: rows, overdueAmount, nextDueAt: next?.dueAt ?? null, nextDueAmount: next?.outstanding ?? ZERO };
}

export function assertCurrency(currencies: string[], requested?: string): string {
  const unique = [...new Set([...currencies, ...(requested ? [requested] : [])].map(c => c.toUpperCase()))];
  if (unique.length > 1) throw badRequest("This student ledger uses one currency. Mixed currencies require separate ledgers.");
  return unique[0] ?? "RWF";
}
