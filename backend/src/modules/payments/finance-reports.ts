import { Prisma } from "../../generated/prisma/client.js";
import { allocateObligations,assertCurrency } from "../../lib/finance-policy.js";
import { prisma } from "../../lib/prisma.js";
import type { FinanceSummaryQuery } from "./payments.schema.js";

const ZERO = new Prisma.Decimal(0);
interface Bucket { key: string; label: string; billed: Prisma.Decimal; collected: Prisma.Decimal; outstanding: Prisma.Decimal }
export async function getFinanceSummary(query: FinanceSummaryQuery) {
  const scope = { ...(query.campusId ? { campusId: query.campusId } : {}),
    ...(query.intakeId ? { intakeId: query.intakeId } : {}), ...(query.levelId ? { levelId: query.levelId } : {}) };
  const hasScope = Object.keys(scope).length > 0;
  const include = { enrollment: { include: { level: true, intake: true, campus: true } } } as const;
  const charges = await prisma.charge.findMany({ include });
  const payments = await prisma.payment.findMany({ include: { ...include, method: true } });
  const discounts = await prisma.discount.findMany({ where: { status: "APPROVED" }, include });
  const within = (date: Date) => (!query.from || date >= query.from) && (!query.to || date <= query.to);
  const matches = (enrollment: { campusId: string; intakeId: string; levelId: string } | null) =>
    !hasScope || !!enrollment && Object.entries(scope).every(([key, value]) => enrollment[key as keyof typeof enrollment] === value);
  const includedCharges = charges.filter(row => matches(row.enrollment));
  const includedPayments = payments.filter(row => matches(row.enrollment));
  const currency = assertCurrency([...includedCharges, ...includedPayments].map(row => row.currency));
  const levels = new Map<string, Bucket>(), intakes = new Map<string, Bucket>(), campuses = new Map<string, Bucket>();
  const methods = new Map<string, { methodId: string; methodCode: string; methodName: string; total: Prisma.Decimal }>();
  let totalBilled = ZERO, totalCollected = ZERO, totalOutstanding = ZERO, totalDiscounts = ZERO;
  function add(enrollment: typeof charges[number]["enrollment"], field: "billed" | "collected" | "outstanding", amount: Prisma.Decimal) {
    for (const [map, dimension] of [[levels, enrollment?.level], [intakes, enrollment?.intake], [campuses, enrollment?.campus]] as const) {
      const key = dimension?.id ?? "unassigned";
      const bucket = map.get(key) ?? { key, label: dimension ? ("title" in dimension ? dimension.title : dimension.name) : "Unassigned", billed: ZERO, collected: ZERO, outstanding: ZERO };
      bucket[field] = bucket[field].plus(amount); map.set(key, bucket);
    }
  }
  for (const charge of includedCharges.filter(row => within(row.createdAt))) { totalBilled = totalBilled.plus(charge.amount); add(charge.enrollment, "billed", charge.amount); }
  for (const discount of discounts.filter(row => matches(row.enrollment) && within(row.approvedAt ?? row.createdAt))) {
    totalDiscounts = totalDiscounts.plus(discount.amount); totalBilled = totalBilled.minus(discount.amount); add(discount.enrollment, "billed", discount.amount.negated());
  }
  for (const payment of includedPayments.filter(row => within(row.paidAt))) {
    const amount = payment.txnType === "REFUND" ? payment.amount.negated() : payment.amount;
    totalCollected = totalCollected.plus(amount); add(payment.enrollment, "collected", amount);
    const bucket = methods.get(payment.methodId) ?? { methodId: payment.methodId, methodCode: payment.method.code, methodName: payment.method.name, total: ZERO };
    bucket.total = bucket.total.plus(amount); methods.set(payment.methodId, bucket);
  }
  for (const studentId of new Set(charges.map(row => row.studentId))) {
    const studentCharges = charges.filter(row => row.studentId === studentId);
    const paid = payments.filter(row => row.studentId === studentId).reduce((sum, row) => sum.plus(row.txnType === "REFUND" ? row.amount.negated() : row.amount), ZERO);
    const discounted = discounts.filter(row => row.studentId === studentId).reduce((sum, row) => sum.plus(row.amount), ZERO);
    const allocation = allocateObligations(studentCharges, paid.plus(discounted));
    for (const obligation of allocation.obligations) {
      const charge = studentCharges.find(row => row.id === obligation.id)!;
      if (matches(charge.enrollment)) { totalOutstanding = totalOutstanding.plus(obligation.outstanding); add(charge.enrollment, "outstanding", obligation.outstanding); }
    }
  }
  return { currency, totalBilled, totalCollected, totalOutstanding, totalDiscounts,
    outstandingBasis: "Current unpaid obligations; billed and collected follow the selected date range",
    collectionRate: totalBilled.greaterThan(0) ? totalCollected.dividedBy(totalBilled).times(100).toDecimalPlaces(2).toNumber() : 0,
    byMethod: [...methods.values()], byLevel: [...levels.values()], byIntake: [...intakes.values()], byCampus: [...campuses.values()] };
}
