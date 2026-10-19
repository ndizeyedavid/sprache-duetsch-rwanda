import { Prisma } from "../../generated/prisma/client.js";
import { allocateObligations,assertCurrency } from "../../lib/finance-policy.js";
import { resolveIntakeId } from "../../lib/intake-scope.js";
import type { FinanceLedger,LedgerRow } from "./finance-ledger.js";
import { loadFinanceLedger } from "./finance-ledger.js";
import type { FinanceSummaryQuery } from "./payments.schema.js";

const ZERO = new Prisma.Decimal(0);
export interface FinanceBucket { key: string; label: string; billed: Prisma.Decimal; collected: Prisma.Decimal; outstanding: Prisma.Decimal }
type Field = "billed" | "collected" | "outstanding";

/**
 * Billed = charges less approved discounts, collected = payments less refunds (both inside the
 * optional date range); outstanding = currently unpaid obligations. Intake attribution follows
 * `resolveIntakeId` (enrolment intake, else the student's intake); level/campus need an enrolment.
 */
export function computeFinance(ledger: FinanceLedger, query: FinanceSummaryQuery, now = new Date()) {
  const within = (date: Date) => (!query.from || date >= query.from) && (!query.to || date <= query.to);
  const matches = (row: LedgerRow) => {
    if (query.intakeId && resolveIntakeId(row) !== query.intakeId) return false;
    if (!query.campusId && !query.levelId) return true;
    return !!row.enrollment && (!query.campusId || row.enrollment.campusId === query.campusId)
      && (!query.levelId || row.enrollment.levelId === query.levelId);
  };
  const levels = new Map<string, FinanceBucket>(), intakes = new Map<string, FinanceBucket>(), campuses = new Map<string, FinanceBucket>();
  const methods = new Map<string, { methodId: string; methodCode: string; methodName: string; total: Prisma.Decimal }>();
  const overdueStudentIds = new Set<string>();
  let totalBilled = ZERO, totalCollected = ZERO, totalOutstanding = ZERO, totalDiscounts = ZERO;
  function bump(map: Map<string, FinanceBucket>, dimension: { id: string; label: string } | null, field: Field, amount: Prisma.Decimal) {
    const key = dimension?.id ?? "unassigned";
    const bucket = map.get(key) ?? { key, label: dimension?.label ?? "Unassigned", billed: ZERO, collected: ZERO, outstanding: ZERO };
    bucket[field] = bucket[field].plus(amount); map.set(key, bucket);
  }
  function add(row: LedgerRow, field: Field, amount: Prisma.Decimal) {
    const { level, campus } = row.enrollment ?? {};
    const intake = row.enrollment?.intake ?? row.student.intake;
    bump(levels, level ? { id: level.id, label: level.title } : null, field, amount);
    bump(intakes, intake ? { id: intake.id, label: intake.name } : null, field, amount);
    bump(campuses, campus ? { id: campus.id, label: campus.name } : null, field, amount);
  }
  const charges = ledger.charges.filter(matches), payments = ledger.payments.filter(matches);
  for (const charge of charges.filter(row => within(row.createdAt))) { totalBilled = totalBilled.plus(charge.amount); add(charge, "billed", charge.amount); }
  for (const discount of ledger.discounts.filter(row => matches(row) && within(row.approvedAt ?? row.createdAt))) {
    totalDiscounts = totalDiscounts.plus(discount.amount); totalBilled = totalBilled.minus(discount.amount); add(discount, "billed", discount.amount.negated());
  }
  for (const payment of payments.filter(row => within(row.paidAt))) {
    const amount = payment.txnType === "REFUND" ? payment.amount.negated() : payment.amount;
    totalCollected = totalCollected.plus(amount); add(payment, "collected", amount);
    const bucket = methods.get(payment.methodId) ?? { methodId: payment.methodId, methodCode: payment.method.code, methodName: payment.method.name, total: ZERO };
    bucket.total = bucket.total.plus(amount); methods.set(payment.methodId, bucket);
  }
  // Allocation runs over each student's whole ledger (same as recalculateStudentFinance),
  // then only the obligations inside the scope are counted.
  const credit = new Map<string, Prisma.Decimal>();
  for (const row of ledger.payments) credit.set(row.studentId, (credit.get(row.studentId) ?? ZERO).plus(row.txnType === "REFUND" ? row.amount.negated() : row.amount));
  for (const row of ledger.discounts) credit.set(row.studentId, (credit.get(row.studentId) ?? ZERO).plus(row.amount));
  const chargesByStudent = new Map<string, FinanceLedger["charges"]>();
  for (const row of ledger.charges) chargesByStudent.set(row.studentId, [...(chargesByStudent.get(row.studentId) ?? []), row]);
  for (const [studentId, studentCharges] of chargesByStudent) {
    for (const obligation of allocateObligations(studentCharges, credit.get(studentId) ?? ZERO, now).obligations) {
      if (!matches(obligation)) continue;
      totalOutstanding = totalOutstanding.plus(obligation.outstanding); add(obligation, "outstanding", obligation.outstanding);
      if (obligation.overdue) overdueStudentIds.add(studentId);
    }
  }
  return { charges, payments, overdueStudentIds, intakes, summary: { totalBilled, totalCollected, totalOutstanding, totalDiscounts,
    outstandingBasis: "Current unpaid obligations; billed and collected follow the selected date range",
    collectionRate: totalBilled.greaterThan(0) ? totalCollected.dividedBy(totalBilled).times(100).toDecimalPlaces(2).toNumber() : 0,
    byMethod: [...methods.values()], byLevel: [...levels.values()], byIntake: [...intakes.values()], byCampus: [...campuses.values()] } };
}

export async function getFinanceReport(query: FinanceSummaryQuery) {
  const result = computeFinance(await loadFinanceLedger(), query);
  const currency = assertCurrency([...result.charges, ...result.payments].map(row => row.currency));
  return { ...result, summary: { currency, ...result.summary } };
}

export async function getFinanceSummary(query: FinanceSummaryQuery) {
  return (await getFinanceReport(query)).summary;
}
