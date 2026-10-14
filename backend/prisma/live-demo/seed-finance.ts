import { recalculateStudentFinance } from "../../src/lib/finance.js";
import { prisma } from "../../src/lib/prisma.js";
import { demoStudents } from "./accounts.js";
import type { DemoContext } from "./context.js";
import { daysFromNow } from "./context.js";

/** Enrolments, charges (instalments for B1), discounts, payments, refunds and receipts per payment case. */
export async function seedFinance(ctx: DemoContext) {
  const financeId = ctx.staff.get("finance")!;
  let receiptNo = 0;

  for (const seed of demoStudents) {
    const ids = ctx.students.get(seed.key)!;
    if (!seed.enrollment) {
      await prisma.studentFinance.create({ data: { studentId: ids.studentId } });
      continue;
    }
    const { finance } = seed;
    const discount = finance.discountPercent ? (finance.fee * finance.discountPercent) / 100 : 0;
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: ids.studentId, levelId: ctx.levels.get(seed.level)!, intakeId: ctx.intakeId,
        campusId: ctx.campuses.get(seed.campus)!, classGroupId: seed.inClass ? ctx.classes.get(seed.level)! : null,
        status: seed.enrollment, totalFee: finance.fee, discountTotal: discount,
        enrolledAt: daysFromNow(-60), completedAt: seed.enrollment === "COMPLETED" ? daysFromNow(-14) : null,
      },
    });
    ids.enrollmentId = enrollment.id;

    const instalments = seed.level === "B1"
      ? [{ part: "Rate 1/2", amount: finance.fee / 2, due: -30 }, { part: "Rate 2/2", amount: finance.fee / 2, due: finance.dueInDays }]
      : [{ part: "", amount: finance.fee, due: finance.dueInDays }];
    for (const item of instalments) {
      await prisma.charge.create({
        data: {
          studentId: ids.studentId, enrollmentId: enrollment.id, type: "TUITION", amount: item.amount, dueDate: daysFromNow(item.due),
          description: `Tuition — Deutsch ${seed.level} (DEMO)${item.part ? ` · ${item.part}` : ""}`, createdById: financeId,
        },
      });
    }

    if (discount > 0) {
      await prisma.discount.create({
        data: {
          studentId: ids.studentId, enrollmentId: enrollment.id, type: "PERCENTAGE", value: finance.discountPercent!, amount: discount,
          reason: "Full scholarship (demo)", status: "APPROVED", requestedById: ctx.staff.get("academic")!, approvedById: financeId,
          approvedAt: daysFromNow(-50),
        },
      });
    }

    let lastPaymentId: string | null = null;
    for (const pay of finance.payments) {
      receiptNo += 1;
      const payment = await prisma.payment.create({
        data: {
          studentId: ids.studentId, enrollmentId: enrollment.id, methodId: ctx.methods.get(pay.method)!, amount: pay.amount,
          txnType: "PAYMENT", reference: `DEMO-PAY-${seed.code}-${receiptNo}`, paidAt: daysFromNow(-pay.daysAgo), receivedById: financeId,
          receipt: { create: { receiptNumber: `DEMO-RCP-${String(receiptNo).padStart(4, "0")}`, issuedById: financeId } },
        },
      });
      lastPaymentId = payment.id;
    }

    if (finance.refund && lastPaymentId) {
      await prisma.payment.create({
        data: {
          studentId: ids.studentId, enrollmentId: enrollment.id, methodId: ctx.methods.get("MOMO")!, amount: finance.refund,
          txnType: "REFUND", parentPaymentId: lastPaymentId, reference: `DEMO-REFUND-${seed.code}`, paidAt: daysFromNow(-20),
          receivedById: financeId, notes: "Withdrew before the course started (demo)",
        },
      });
    }

    await recalculateStudentFinance(prisma, ids.studentId);
  }
}
