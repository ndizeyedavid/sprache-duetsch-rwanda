import { describe, expect, it } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { paidCourseLevels,paidEnrollments } from './course-payment-access.js';
const decimal = (amount: number) => new Prisma.Decimal(amount);
const enrollments = [{ id: 'a', levelId: 'A1', enrolledAt: new Date(0), totalFee: decimal(1234) }, { id: 'b', levelId: 'B1', enrolledAt: new Date(0), totalFee: decimal(5678) }];
const charges = enrollments.map((row, index) => ({ id: row.id, enrollmentId: row.id, type: 'TUITION', amount: row.totalFee, dueDate: null, createdAt: new Date(index * 1000) }));
describe('course-specific tuition access', () => {
  it('locks unpaid and partially paid courses', () => {
    expect(paidCourseLevels(enrollments, charges, decimal(0))).toEqual([]);
    expect(paidCourseLevels(enrollments, charges, decimal(1233))).toEqual([]);
  });
  it('unlocks a settled course without requiring payment for another course', () => {
    expect(paidCourseLevels(enrollments, charges, decimal(1234))).toEqual(['A1']);
    expect(paidCourseLevels(enrollments, charges, decimal(6912))).toEqual(['A1', 'B1']);
  });
  it('keeps free courses open and refuses a paid enrollment with missing charges', () => {
    expect(paidCourseLevels([{ ...enrollments[0], totalFee: decimal(0) }], [], decimal(0))).toEqual(['A1']);
    expect(paidCourseLevels(enrollments, [], decimal(10000))).toEqual([]);
  });
  it('requires payment for the latest enrollment when repeating a level in another intake', () => {
    const repeat = { ...enrollments[0], id: 'repeat', enrolledAt: new Date(2000), totalFee: decimal(4321) };
    const repeatedCharges = [...charges, { ...charges[0], id: 'repeat-charge', enrollmentId: repeat.id, amount: repeat.totalFee, createdAt: repeat.enrolledAt }];
    expect(paidCourseLevels([repeat, ...enrollments], repeatedCharges, decimal(1234))).toEqual([]);
    expect(paidCourseLevels([...enrollments, repeat], repeatedCharges, decimal(11233))).toEqual(['A1', 'B1']);
  });
  it('keeps an older paid class enrolment when a newer one exists in the same level', () => {
    const extra = { ...enrollments[0], id: 'extra', enrolledAt: new Date(2000), totalFee: decimal(0) };
    expect(paidEnrollments([...enrollments, extra], charges, decimal(6912)).map(row => row.id)).toEqual(['a', 'b', 'extra']);
    expect(paidEnrollments([...enrollments, extra], charges, decimal(1234)).map(row => row.id)).toEqual(['a', 'extra']);
  });
  it('locks a course again after credit is reduced by a refund', () => {
    expect(paidCourseLevels(enrollments, charges, decimal(1200))).toEqual([]);
  });
});
