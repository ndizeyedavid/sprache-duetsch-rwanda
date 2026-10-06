import { writeActivityTx } from "../activity/activity-transaction.js";
import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { assertStudentCurrency,recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { checkEnrollmentClass,reconcileStudent } from "./enrollment-policy.js";
import type { CreateEnrollmentInput,UpdateEnrollmentInput } from "./enrollments.schema.js";
import { writeTuitionSchedule } from "./tuition-schedule.js";

export const createEnrollment = (input: CreateEnrollmentInput, actorId?: string) => transact(async tx => {
  const student = await tx.student.findUnique({ where: { id: input.studentId } });
  const level = await tx.level.findUnique({ where: { id: input.levelId } });
  const intake = await tx.intake.findUnique({ where: { id: input.intakeId } });
  if (!student || !level || !intake) throw notFound("Student, level or intake not found");
  if (["SUSPENDED", "WITHDRAWN"].includes(student.status)) throw badRequest("Student account cannot be enrolled in its current status");
  if (!level.isActive || !intake.isActive) throw badRequest("Choose an active level and intake");
  const now = new Date();
  const outsideWindow = intake.endDate < now || (intake.enrollmentOpensAt && now < intake.enrollmentOpensAt) || (intake.enrollmentEndsAt && now > intake.enrollmentEndsAt);
  if (outsideWindow && !input.windowOverrideReason) throw badRequest("Intake enrolment is closed. An audited override reason is required.");
  const campusId = input.campusId ?? student.campusId;
  if (!campusId || !await tx.campus.findFirst({ where: { id: campusId, isActive: true } })) throw badRequest("Choose an active campus");
  await checkEnrollmentClass(tx, { ...input, campusId, active: true });
  const existing = await tx.enrollment.findUnique({ where: { studentId_levelId_intakeId: {
    studentId: input.studentId, levelId: input.levelId, intakeId: input.intakeId,
  } } });
  if (existing) throw conflict("Student already has this enrolment; manage its status instead");
  if (input.discountTotal) throw badRequest("Request and approve discounts through Finance");
  const currency = await assertStudentCurrency(tx, input.studentId, input.currency ?? level.currency);
  if (intake.currency.toUpperCase() !== currency && (intake.registrationFee.greaterThan(0) || intake.bookFee.greaterThan(0))) throw badRequest("Intake fees and tuition must use the same currency");
  const totalFee = new Prisma.Decimal(input.totalFee ?? level.defaultFee);
  const firstInIntake = !await tx.enrollment.findFirst({ where: { studentId: input.studentId, intakeId: input.intakeId } });
  const enrollment = await tx.enrollment.create({ data: { studentId: input.studentId, levelId: input.levelId,
    intakeId: input.intakeId, campusId, classGroupId: input.classGroupId, totalFee, currency } });
  await writeTuitionSchedule(tx, { studentId: input.studentId, enrollmentId: enrollment.id, totalFee, currency,
    installments: input.installments, dueDate: input.dueDate ? new Date(input.dueDate) : intake.startDate,
    description: `Tuition — ${level.title} (${intake.code})`, actorId });
  if (firstInIntake) for (const fee of [{ type: "REGISTRATION" as const, amount: intake.registrationFee }, { type: "BOOKS" as const, amount: intake.bookFee }]) {
    if (fee.amount.greaterThan(0)) await tx.charge.create({ data: { studentId: input.studentId,
      enrollmentId: enrollment.id, type: fee.type, description: `${fee.type} — ${intake.code}`,
      amount: fee.amount, currency, dueDate: intake.startDate, createdById: actorId } });
  }
  await reconcileStudent(tx, input.studentId);
  await recalculateStudentFinance(tx, input.studentId);
  await writeAuditTx(tx, { actorId, action: "ENROLLMENT_CREATED", entityType: "Enrollment", entityId: enrollment.id,
    after: enrollment, reason: input.windowOverrideReason });
  await writeActivityTx(tx, { actorId, type: "ENROLLMENT", title: `New enrolment in ${level.title}`, body: `Enrolled for intake ${intake.code}.`, studentId: input.studentId });
  return enrollment;
});

export const updateEnrollment = (id: string, input: UpdateEnrollmentInput, actorId?: string) => transact(async tx => {
  const before = await tx.enrollment.findUnique({ where: { id } });
  if (!before) throw notFound("Enrolment not found");
  if (input.discountTotal !== undefined) throw badRequest("Use the audited Finance discount workflow");
  const status = input.status ?? before.status;
  await checkEnrollmentClass(tx, { ...before, classGroupId: input.classGroupId === undefined ? before.classGroupId : input.classGroupId,
    active: status === "ACTIVE", enrollmentId: id });
  const totalFee = new Prisma.Decimal(input.totalFee ?? before.totalFee);
  const enrollment = await tx.enrollment.update({ where: { id }, data: {
    status, classGroupId: input.classGroupId, totalFee,
    completedAt: status === "COMPLETED" ? before.completedAt ?? new Date() : null,
  } });
  if (input.totalFee !== undefined || input.installments) {
    const tuition = await tx.charge.findMany({ where: { enrollmentId: id, type: "TUITION" }, orderBy: { dueDate: "asc" } });
    if (tuition.length > 1 && !input.installments) throw badRequest("Provide the revised instalment schedule when changing tuition");
    await writeTuitionSchedule(tx, { studentId: before.studentId, enrollmentId: id, currency: before.currency,
      totalFee, installments: input.installments, dueDate: tuition[0]?.dueDate ?? new Date(),
      description: tuition[0]?.description ?? "Tuition", actorId });
    const charges = await tx.charge.aggregate({ where: { studentId: before.studentId }, _sum: { amount: true } });
    const discounts = await tx.discount.aggregate({ where: { studentId: before.studentId, status: "APPROVED" }, _sum: { amount: true } });
    if (new Prisma.Decimal(discounts._sum.amount ?? 0).greaterThan(charges._sum.amount ?? 0)) throw badRequest("Tuition change would exceed approved discount coverage");
  }
  await reconcileStudent(tx, before.studentId);
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "ENROLLMENT_UPDATED", entityType: "Enrollment", entityId: id, before, after: enrollment, reason: input.reason });
  return enrollment;
});
