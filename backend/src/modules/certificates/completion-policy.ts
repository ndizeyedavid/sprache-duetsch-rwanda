import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

export const completionRulesSchema = z.object({
  minimumAttendance: z.number().min(0).max(100).default(0),
  requireHomework: z.boolean().default(false),
  homeworkPassMark: z.number().min(0).max(100).default(50),
});

export async function checkEligibility(studentId: string, levelId: string, tx: Prisma.TransactionClient = prisma) {
  const student = await tx.student.findUnique({ where: { id: studentId }, include: {
    user: { select: { firstName: true, lastName: true } }, enrollments: { where: { levelId, status: { in: ["ACTIVE", "COMPLETED"] } }, orderBy: { enrolledAt: "desc" } },
  } });
  const level = await tx.level.findUnique({ where: { id: levelId } });
  if (!student || !level) throw notFound("Student or level not found");
  const rules = completionRulesSchema.parse(level.completionRules ?? {});
  const lessons = await tx.lesson.findMany({ where: { isPublished: true, module: { levelId, isPublished: true } }, select: { id: true } });
  const completed = await tx.lessonProgress.count({ where: { studentId, status: "COMPLETED", lessonId: { in: lessons.map(row => row.id) } } });
  const finals = await tx.assessment.findMany({ where: { levelId, type: "FINAL_EXAM", isPublished: true }, select: { id: true } });
  const passedFinals = await tx.attempt.findMany({ where: { studentId, status: "GRADED", passed: true, assessmentId: { in: finals.map(row => row.id) } }, distinct: ["assessmentId"], select: { assessmentId: true } });
  const finalExamPassed = finals.length ? passedFinals.length === finals.length : null;
  const existingCertificate = await tx.certificate.findFirst({ where: { studentId, levelId, status: "ISSUED" }, select: { id: true, certificateNumber: true } });
  const classes = student.enrollments.flatMap(row => row.classGroupId ? [row.classGroupId] : []);
  const attendance = await tx.attendance.findMany({ where: { studentId, session: { classGroupId: { in: classes }, status: { not: "CANCELLED" } } }, select: { status: true } });
  const attendancePercentage = attendance.length ? attendance.filter(row => ["PRESENT", "LATE"].includes(row.status)).length / attendance.length * 100 : 0;
  const homework = rules.requireHomework ? await tx.assignment.findMany({ where: { classGroupId: { in: classes }, status: "PUBLISHED",
    OR: [{ recipients: { none: {} } }, { recipients: { some: { studentId } } }] }, include: { submissions: { where: { studentId } } } }) : [];
  const homeworkPassed = homework.every(row => row.submissions.some(sub => sub.status === "GRADED" && Number(sub.score ?? 0) / Number(row.maxPoints) * 100 >= rules.homeworkPassMark));
  const reasons: string[] = [];
  if (!student.enrollments.length) reasons.push("No active or completed enrolment");
  if (["SUSPENDED", "WITHDRAWN"].includes(student.status)) reasons.push("Student account is blocked");
  if (!lessons.length || completed < lessons.length) reasons.push(`${completed}/${lessons.length} lessons completed`);
  if (finalExamPassed === false) reasons.push("Pass every required published final exam");
  if (rules.minimumAttendance > 0 && attendancePercentage < rules.minimumAttendance) reasons.push("Attendance requirement not met");
  if (!homeworkPassed) reasons.push("Required homework not passed");
  if (existingCertificate) reasons.push(`Already issued (${existingCertificate.certificateNumber})`);
  return { eligible: reasons.length === 0, reasons, studentName: `${student.user.firstName} ${student.user.lastName}`,
    level, enrollmentId: student.enrollments[0]?.id ?? null, lessonsTotal: lessons.length,
    lessonsCompleted: completed, completionPercentage: lessons.length ? Math.round(completed / lessons.length * 100) : 0,
    finalExamPassed, existingCertificate, attendancePercentage, homeworkPassed, rules };
}
