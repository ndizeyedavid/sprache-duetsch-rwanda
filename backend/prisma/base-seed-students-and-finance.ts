import { recalculateStudentFinance } from "../src/lib/finance.js";
import { hashPassword } from "../src/lib/password.js";
import { prisma } from "../src/lib/prisma.js";
import { daysFromNow } from './base-days-from-now.js';
import { studentSeeds } from './base-student-seeds.js';
export const seedStudentsAndFinance = async (params: {
  levelIds: Map<string, string>;
  intakeIds: Map<string, string>;
  campusIds: Map<string, string>;
  classIds: Map<string, string>;
  methodIds: Map<string, string>;
  staffIds: Map<string, string>;
}) => {
  const { levelIds, intakeIds, campusIds, classIds, methodIds, staffIds } = params;
  const remeraId = campusIds.get("REMERA")!;
  const financeUserId = staffIds.get("finance@sparch.rw") ?? null;
  const studentIds = new Map<string, string>();

  for (const seed of studentSeeds) {
    const passwordHash = await hashPassword("Student123!");
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {
        firstName: seed.firstName,
        lastName: seed.lastName,
        phone: seed.phone,
        role: "STUDENT",
        status: seed.accountStatus,
        passwordHash,
      },
      create: {
        email: seed.email,
        firstName: seed.firstName,
        lastName: seed.lastName,
        phone: seed.phone,
        role: "STUDENT",
        status: seed.accountStatus,
        passwordHash,
      },
    });

    const levelId = levelIds.get(seed.levelCode)!;
    const intakeId = intakeIds.get(seed.intakeCode)!;

    const student = await prisma.student.upsert({
      where: { studentCode: seed.code },
      update: {
        userId: user.id,
        campusId: remeraId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
      },
      create: {
        studentCode: seed.code,
        userId: user.id,
        campusId: remeraId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
        placementScore: 50,
      },
    });
    studentIds.set(seed.code, student.id);

    // Clear previous demo transactions so the seed stays idempotent.
    await prisma.payment.deleteMany({ where: { studentId: student.id } });
    await prisma.discount.deleteMany({ where: { studentId: student.id } });
    await prisma.charge.deleteMany({ where: { studentId: student.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: student.id } });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        levelId,
        intakeId,
        campusId: remeraId,
        classGroupId: classIds.get(seed.levelCode) ?? null,
        status: seed.enrollmentStatus,
        totalFee: seed.fee,
        discountTotal: seed.discount,
        completedAt: seed.enrollmentStatus === "COMPLETED" ? daysFromNow(-5) : null,
      },
    });

    await prisma.charge.create({
      data: {
        studentId: student.id,
        enrollmentId: enrollment.id,
        type: "TUITION",
        description: `Studiengebühr ${seed.levelCode}`,
        amount: seed.fee,
        dueDate: daysFromNow(seed.dueInDays),
        createdById: financeUserId,
      },
    });

    if (seed.discount > 0) {
      await prisma.discount.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          type: "FIXED",
          value: seed.discount,
          amount: seed.discount,
          reason: "Stipendium (Seed-Daten)",
          status: "APPROVED",
          requestedById: financeUserId,
          approvedById: financeUserId,
          approvedAt: daysFromNow(-100),
        },
      });
    }

    let lastPaymentId: string | null = null;
    if (seed.paid > 0) {
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodIds.get(seed.methodCode)!,
          amount: seed.paid,
          txnType: "PAYMENT",
          reference: `REF-${seed.code}`,
          paidAt: daysFromNow(-40),
          receivedById: financeUserId,
        },
      });
      lastPaymentId = payment.id;

      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNumber: `RCP-${payment.id.slice(0, 8).toUpperCase()}`,
          issuedById: financeUserId,
        },
      });
    }

    if (seed.refund > 0 && lastPaymentId) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodIds.get(seed.methodCode)!,
          amount: seed.refund,
          txnType: "REFUND",
          parentPaymentId: lastPaymentId,
          reference: `REFUND-${seed.code}`,
          paidAt: daysFromNow(-20),
          receivedById: financeUserId,
          notes: "Rückerstattung (Seed-Daten)",
        },
      });
    }

    await recalculateStudentFinance(prisma, student.id);
  }

  return studentIds;
};
