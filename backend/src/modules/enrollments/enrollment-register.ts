// The admin enrolment register: every enrolment (no page cap) with what admissions need at a glance —
// course access (paid = lessons unlocked), the student's sign-in and lesson progress. Tuition amounts
// are only included for finance roles.
import { Prisma } from "../../generated/prisma/client.js";
import { paidCourseEnrollments } from "../../lib/course-payment-access.js";
import { allocateObligations } from "../../lib/finance-policy.js";
import { prisma } from "../../lib/prisma.js";
import { courseAccess,progressCounts,progressKey } from "./register-insights.js";

const ZERO = new Prisma.Decimal(0);

export async function enrollmentRegister(options: { withMoney: boolean; intakeId?: string }) {
  const rows = await prisma.enrollment.findMany({
    where: options.intakeId ? { intakeId: options.intakeId } : {},
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, studentCode: true, status: true, user: { select: { firstName: true, lastName: true, email: true, phone: true, status: true, lastLoginAt: true } } } },
      level: { select: { id: true, code: true, title: true } },
      intake: { select: { id: true, code: true, name: true } },
      campus: { select: { id: true, code: true, name: true } },
      classGroup: { select: { id: true, code: true, name: true, shift: true } },
    },
  });
  const studentIds = [...new Set(rows.map((row) => row.studentId))];
  const levelIds = [...new Set(rows.map((row) => row.levelId))];
  const [allEnrollments, charges, finances, lessons, completed] = await Promise.all([
    prisma.enrollment.findMany({ where: { studentId: { in: studentIds }, status: { in: ["ACTIVE", "COMPLETED"] } }, select: { id: true, studentId: true, levelId: true, totalFee: true, enrolledAt: true } }),
    prisma.charge.findMany({ where: { studentId: { in: studentIds } }, select: { id: true, studentId: true, enrollmentId: true, type: true, amount: true, dueDate: true, createdAt: true, description: true } }),
    prisma.studentFinance.findMany({ where: { studentId: { in: studentIds } }, select: { studentId: true, totalPaid: true, totalDiscount: true } }),
    prisma.lesson.findMany({ where: { isPublished: true, module: { isPublished: true, levelId: { in: levelIds } } }, select: { module: { select: { levelId: true } } } }),
    prisma.lessonProgress.findMany({
      where: { studentId: { in: studentIds }, status: "COMPLETED", lesson: { isPublished: true, module: { isPublished: true, levelId: { in: levelIds } } } },
      select: { studentId: true, lesson: { select: { module: { select: { levelId: true } } } } },
    }),
  ]);

  const lessonsPerLevel = new Map<string, number>();
  for (const lesson of lessons) lessonsPerLevel.set(lesson.module.levelId, (lessonsPerLevel.get(lesson.module.levelId) ?? 0) + 1);
  const done = progressCounts(completed.map((row) => ({ studentId: row.studentId, levelId: row.lesson.module.levelId })));
  const credit = new Map(finances.map((row) => [row.studentId, row.totalPaid.plus(row.totalDiscount)]));

  // Per student: which enrolments are paid (course unlocked) and what is still owed on each.
  const paid = new Set<string>();
  const owed = new Map<string, { outstanding: Prisma.Decimal; overdue: boolean }>();
  for (const studentId of studentIds) {
    const own = charges.filter((charge) => charge.studentId === studentId);
    const studentCredit = credit.get(studentId) ?? ZERO;
    for (const enrollment of paidCourseEnrollments(allEnrollments.filter((row) => row.studentId === studentId), own, studentCredit)) paid.add(enrollment.id);
    for (const charge of allocateObligations(own, studentCredit).obligations) {
      if (charge.type !== "TUITION" || !charge.enrollmentId) continue;
      const entry = owed.get(charge.enrollmentId) ?? { outstanding: ZERO, overdue: false };
      owed.set(charge.enrollmentId, { outstanding: entry.outstanding.plus(charge.outstanding), overdue: entry.overdue || charge.overdue });
    }
  }

  return rows.map((row) => {
    const access = courseAccess({ enrollmentStatus: row.status, accountStatuses: [row.student.status, row.student.user.status], paid: paid.has(row.id) });
    const money = owed.get(row.id);
    return {
      ...row,
      charges: options.withMoney ? charges.filter((charge) => charge.enrollmentId === row.id).map(({ id, type, amount, dueDate }) => ({ id, type, amount, dueDate })) : undefined,
      totalFee: options.withMoney ? row.totalFee : undefined,
      discountTotal: options.withMoney ? row.discountTotal : undefined,
      access,
      tuition: options.withMoney ? { outstanding: money?.outstanding ?? ZERO, overdue: money?.overdue ?? false } : undefined,
      progress: { lessonsDone: done.get(progressKey(row.studentId, row.levelId)) ?? 0, lessonsTotal: lessonsPerLevel.get(row.levelId) ?? 0 },
      lastLoginAt: row.student.user.lastLoginAt,
    };
  });
}
