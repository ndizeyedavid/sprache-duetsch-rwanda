import { recalculateStudentFinance } from "../src/lib/finance.js";
import { hashPassword } from "../src/lib/password.js";
import { prisma } from "../src/lib/prisma.js";
import { daysFromNow } from './demo-days-from-now.js';
import { demoStudentSeeds } from './demo-demo-student-seeds.js';
export const seedDemoStudentsAndFinance = async (params: {
  levelIds: Map<string, string>;
  classIds: Map<string, string>;
  campusId: string;
}) => {
  const { levelIds, classIds, campusId } = params;
  const financeUser = await prisma.user.findUnique({
    where: { email: "finance@sparch.rw" },
    select: { id: true },
  });
  const financeUserId = financeUser?.id ?? null;

  const intakes = await prisma.intake.findMany({ select: { code: true, id: true } });
  const intakeMap = new Map(intakes.map((i) => [i.code, i.id]));

  const methods = await prisma.paymentMethodConfig.findMany({ select: { code: true, id: true } });
  const methodMap = new Map(methods.map((m) => [m.code, m.id]));

  for (const seed of demoStudentSeeds) {
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
    const intakeId = intakeMap.get(seed.intakeCode)!;

    const student = await prisma.student.upsert({
      where: { studentCode: seed.code },
      update: {
        userId: user.id,
        campusId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
      },
      create: {
        studentCode: seed.code,
        userId: user.id,
        campusId,
        intakeId,
        intendedLevelId: levelId,
        currentLevelId: levelId,
        shift: seed.shift,
        status: seed.accountStatus,
        placementScore: 50,
      },
    });

    await prisma.payment.deleteMany({ where: { studentId: student.id } });
    await prisma.discount.deleteMany({ where: { studentId: student.id } });
    await prisma.charge.deleteMany({ where: { studentId: student.id } });
    await prisma.enrollment.deleteMany({ where: { studentId: student.id } });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        levelId,
        intakeId,
        campusId,
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
    if (seed.paid > 0 && methodMap.has(seed.methodCode)) {
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodMap.get(seed.methodCode)!,
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

    if (seed.refund > 0 && lastPaymentId && methodMap.has(seed.methodCode)) {
      await prisma.payment.create({
        data: {
          studentId: student.id,
          enrollmentId: enrollment.id,
          methodId: methodMap.get(seed.methodCode)!,
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
};
