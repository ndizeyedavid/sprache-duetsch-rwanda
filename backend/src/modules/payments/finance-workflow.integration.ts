import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assertPaymentAccess,loadStudentAccessProfile } from '../../lib/access.js';
import { recalculateStudentFinance } from '../../lib/finance.js';
import { prisma } from '../../lib/prisma.js';
import { createEnrollment,updateEnrollment } from '../enrollments/enrollment-commands.js';
import { approveDiscount,createDiscount } from './discount-commands.js';
import { getFinanceSummary } from './finance-reports.js';
import { createPayment,deletePayment,updatePayment } from './payment-commands.js';
import { createRefund } from './refund-commands.js';
const stamp = `finance-check-${randomUUID()}`;
const userIds: string[] = [], studentIds: string[] = [], intakeIds: string[] = [], classIds: string[] = [];
let campusId: string | undefined, levelId: string | undefined, methodId: string | undefined;
try {
  const campus = await prisma.campus.create({ data: { code: stamp, name: stamp } }); campusId = campus.id;
  const level = await prisma.level.create({ data: { code: stamp, title: stamp, levelLabel: 'A1', defaultFee: 200 } }); levelId = level.id;
  const now = Date.now();
  const intake = await prisma.intake.create({ data: { code: stamp, name: stamp, levels: { connect: { id: level.id } }, startDate: new Date(now + 86400000), endDate: new Date(now + 30 * 86400000), registrationFee: 20, bookFee: 10 } }); intakeIds.push(intake.id);
  const group = await prisma.classGroup.create({ data: { code: stamp, name: stamp, levelId: level.id, campusId: campus.id, intakeId: intake.id, capacity: 1, shift: 'EVENING' } }); classIds.push(group.id);
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({ data: { email: `${stamp}-${i}@test.local`, firstName: 'Fixture', lastName: 'Student', passwordHash: 'unused', role: 'STUDENT', status: 'ACTIVE' } }); userIds.push(user.id);
    const student = await prisma.student.create({ data: { studentCode: `${stamp}-${i}`, userId: user.id, campusId: campus.id, status: 'ACTIVE' } }); studentIds.push(student.id);
  }
  const method = await prisma.paymentMethodConfig.create({ data: { code: stamp, name: stamp, isActive: true } }); methodId = method.id;
  const enrollment = await createEnrollment({ studentId: studentIds[0], levelId: level.id, intakeId: intake.id, classGroupId: group.id,
    installments: [{ amount: 100, dueDate: new Date(now - 86400000) }, { amount: 100, dueDate: new Date(now + 10 * 86400000) }] });
  let finance = await recalculateStudentFinance(prisma, studentIds[0]);
  assert.equal(finance.totalDue.toString(), '200'); assert.equal(finance.overdueAmount.toString(), '100');
  await assert.rejects(createEnrollment({ studentId: studentIds[1], levelId: level.id, intakeId: intake.id, classGroupId: group.id }), /full/);
  await assert.rejects(createPayment({ reference: undefined, notes: undefined, studentId: studentIds[0], amount: 100, methodId: method.id, currency: 'USD' }), /currency/);
  const payment = await createPayment({ reference: undefined, notes: undefined, studentId: studentIds[0], enrollmentId: enrollment.id, amount: 100, methodId: method.id });
  finance = await recalculateStudentFinance(prisma, studentIds[0]);
  assert.equal(finance.overdueAmount.toString(), '0'); assert.equal(finance.status, 'PARTIALLY_PAID');
  const onTime = await loadStudentAccessProfile(userIds[0]);
  assert.doesNotThrow(() => assertPaymentAccess(onTime, 'ASSESSMENT'));
  await Promise.all([createPayment({ reference: undefined, notes: undefined, studentId: studentIds[0], amount: 10, methodId: method.id }), createPayment({ reference: undefined, notes: undefined, studentId: studentIds[0], amount: 10, methodId: method.id })]);
  finance = await recalculateStudentFinance(prisma, studentIds[0]); assert.equal(finance.totalPaid.toString(), '120');
  const refunds = await Promise.allSettled([createRefund({ notes: undefined, paymentId: payment.id, amount: 80, reason: 'Fixture refund one' }), createRefund({ notes: undefined, paymentId: payment.id, amount: 80, reason: 'Fixture refund two' })]);
  assert.equal(refunds.filter(row => row.status === 'fulfilled').length, 1);
  await assert.rejects(updatePayment(payment.id, { reference: undefined, notes: undefined, amount: 50, reason: 'Fixture correction' }), /refunds/);
  await assert.rejects(createDiscount({ studentId: studentIds[0], type: 'PERCENTAGE', value: 150, reason: 'Fixture excessive discount' }), /100/);
  const discount = await createDiscount({ studentId: studentIds[0], type: 'FIXED', value: 10, reason: 'Fixture discount' });
  await approveDiscount(discount.id);
  const receipt = payment.receipt.receiptNumber;
  await deletePayment(payment.id, { reason: 'Fixture void' });
  await assert.rejects(updatePayment(payment.id, { amount: 101, reference: undefined, notes: undefined, reason: 'Fixture invalid correction' }), /Voided/);
  assert.ok((await prisma.receipt.findUniqueOrThrow({ where: { paymentId: payment.id } })).voidedAt);
  const requestKey = randomUUID();
  const retryInput = { idempotencyKey: requestKey, reference: undefined, notes: undefined, studentId: studentIds[0], amount: 5, methodId: method.id };
  const retryPayments = await Promise.all([createPayment(retryInput), createPayment(retryInput)]);
  const nextPayment = retryPayments[0]; assert.equal(nextPayment.id, retryPayments[1].id);
  assert.notEqual(nextPayment.receipt.receiptNumber, receipt);
  assert.equal(await prisma.payment.count({ where: { idempotencyKey: requestKey } }), 1);
  assert.equal(await prisma.activityEvent.count({ where: { studentId: studentIds[0], type: 'PAYMENT', title: 'Payment of 5 RWF recorded' } }), 1);
  await assert.rejects(createPayment({ ...retryInput, amount: 6 }), /different details/);
  const secondIntake = await prisma.intake.create({ data: { code: `${stamp}-next`, name: stamp, levels: { connect: { id: level.id } }, startDate: new Date(now + 40 * 86400000), endDate: new Date(now + 80 * 86400000) } }); intakeIds.push(secondIntake.id);
  await prisma.student.update({ where: { id: studentIds[0] }, data: { intakeId: secondIntake.id } });
  const report = await getFinanceSummary({ intakeId: intake.id }); assert.equal(report.totalBilled.toString(), '200');
  await updateEnrollment(enrollment.id, { status: 'WITHDRAWN' });
  assert.equal((await loadStudentAccessProfile(userIds[0])).levelIds.length, 0);
  const lastSeat = await prisma.classGroup.create({ data: { code: `${stamp}-seat`, name: stamp, levelId: level.id, campusId: campus.id, intakeId: secondIntake.id, capacity: 1, shift: 'EVENING' } }); classIds.push(lastSeat.id);
  const competing = await Promise.allSettled(studentIds.map(studentId => createEnrollment({ studentId, levelId: level.id, intakeId: secondIntake.id, classGroupId: lastSeat.id })));
  assert.equal(competing.filter(row => row.status === 'fulfilled').length, 1);
  assert.equal(await prisma.enrollment.count({ where: { classGroupId: lastSeat.id, status: 'ACTIVE' } }), 1);
  process.stdout.write('Finance integration passed: free intake membership, course instalments, capacity, currency, concurrency, refunds, discounts, receipt voiding, historical reports and withdrawal.\n');
} finally {
  const related = await Promise.all([
    prisma.payment.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
    prisma.charge.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
    prisma.discount.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
    prisma.enrollment.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
    prisma.attempt.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
    prisma.certificate.findMany({ where: { studentId: { in: studentIds } }, select: { id: true } }),
  ]);
  await prisma.auditLog.deleteMany({ where: { OR: [{ entityId: { in: related.flat().map(row => row.id) } }, { actorId: { in: userIds } }] } });
  await prisma.activityEvent.deleteMany({ where: { studentId: { in: studentIds } } });
  await prisma.notificationDelivery.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [ ...studentIds, ...intakeIds, ...classIds ] } } });
  await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.classGroup.deleteMany({ where: { id: { in: classIds } } });
  await prisma.intake.deleteMany({ where: { id: { in: intakeIds } } });
  if (methodId) await prisma.paymentMethodConfig.delete({ where: { id: methodId } });
  if (levelId) await prisma.level.delete({ where: { id: levelId } });
  if (campusId) await prisma.campus.delete({ where: { id: campusId } });
  await prisma.$disconnect();
}
