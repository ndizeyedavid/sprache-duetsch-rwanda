import { prisma } from "../../lib/prisma.js";

/**
 * Every charge, payment and approved discount with the dimensions finance reports group by.
 * `student.intake` is the fallback intake for rows that are not linked to an enrolment
 * (see `resolveIntakeId` in src/lib/intake-scope.ts).
 */
const ledgerInclude = {
  enrollment: { include: { level: true, intake: true, campus: true } },
  student: { select: { intakeId: true, intake: true } },
} as const;

export async function loadFinanceLedger() {
  const [charges, payments, discounts] = await Promise.all([
    prisma.charge.findMany({ include: ledgerInclude }),
    prisma.payment.findMany({ include: { ...ledgerInclude, method: true } }),
    prisma.discount.findMany({ where: { status: "APPROVED" }, include: ledgerInclude }),
  ]);
  return { charges, payments, discounts };
}

export type FinanceLedger = Awaited<ReturnType<typeof loadFinanceLedger>>;
export type LedgerRow = FinanceLedger["charges"][number] | FinanceLedger["payments"][number] | FinanceLedger["discounts"][number];
