import type { Prisma } from "../../generated/prisma/client.js";
import { andWhere,attemptIntakeWhere,attendanceIntakeWhere } from "../../lib/intake-scope.js";
import { prisma } from "../../lib/prisma.js";
import type { DashboardFilter } from "./dashboards.schema.js";
import { emptyStudentScope } from './empty-student-scope.js';
import { computeAtRisk } from './get-at-risk-students.js';
import { percentage } from './percentage.js';
import { round2 } from './round2.js';
export const getAcademicDashboard = async (filter: DashboardFilter) => {
  const studentScope = emptyStudentScope(filter);

  const attemptWhere: Prisma.AttemptWhereInput = { status: "GRADED" };
  if (filter.levelId) attemptWhere.assessment = { levelId: filter.levelId };
  const attemptStudentScope: Prisma.StudentWhereInput = {};
  if (filter.campusId) attemptStudentScope.campusId = filter.campusId;
  if (Object.keys(attemptStudentScope).length > 0) attemptWhere.student = attemptStudentScope;
  andWhere(attemptWhere, filter.intakeId && attemptIntakeWhere(filter.intakeId));

  const attendanceWhere: Prisma.AttendanceWhereInput = {};
  if (filter.levelId) attendanceWhere.session = { classGroup: { levelId: filter.levelId } };
  const attendanceStudentScope: Prisma.StudentWhereInput = {};
  if (filter.campusId) attendanceStudentScope.campusId = filter.campusId;
  if (Object.keys(attendanceStudentScope).length > 0) {
    attendanceWhere.student = attendanceStudentScope;
  }
  andWhere(attendanceWhere, filter.intakeId && attendanceIntakeWhere(filter.intakeId));

  const progressWhere: Prisma.LessonProgressWhereInput = { status: "COMPLETED" };
  if (Object.keys(studentScope).length > 0) progressWhere.student = studentScope;
  if (filter.levelId) progressWhere.lesson = { module: { levelId: filter.levelId } };

  const enrollmentWhere: Prisma.EnrollmentWhereInput = { status: "ACTIVE" };
  if (filter.campusId) enrollmentWhere.campusId = filter.campusId;
  if (filter.intakeId) enrollmentWhere.intakeId = filter.intakeId;
  if (filter.levelId) enrollmentWhere.levelId = filter.levelId;

  const registrationWhere: Prisma.StudentWhereInput = { ...studentScope };
  if (filter.from || filter.to) {
    registrationWhere.createdAt = { gte: filter.from, lte: filter.to };
  }

  const [
    totalStudents,
    activeStudents,
    completed,
    withdrawn,
    newRegistrations,
    byLevelGroups,
    byCampusGroups,
    byIntakeGroups,
    attemptAggregate,
    gradedCount,
    passedCount,
    attendanceGroups,
    progressGroups,
  ] = await Promise.all([
    prisma.student.count({ where: studentScope }),
    prisma.student.count({ where: { ...studentScope, status: "ACTIVE" } }),
    prisma.student.count({ where: { ...studentScope, status: "COMPLETED" } }),
    prisma.student.count({ where: { ...studentScope, status: "WITHDRAWN" } }),
    prisma.student.count({ where: registrationWhere }),
    prisma.enrollment.groupBy({ by: ["levelId"], where: enrollmentWhere, _count: { _all: true } }),
    prisma.student.groupBy({ by: ["campusId"], where: studentScope, _count: { _all: true } }),
    prisma.student.groupBy({ by: ["intakeId"], where: studentScope, _count: { _all: true } }),
    prisma.attempt.aggregate({ where: attemptWhere, _avg: { score: true } }),
    prisma.attempt.count({ where: attemptWhere }),
    prisma.attempt.count({ where: { ...attemptWhere, passed: true } }),
    prisma.attendance.groupBy({ by: ["status"], where: attendanceWhere, _count: { _all: true } }),
    prisma.lessonProgress.groupBy({
      by: ["studentId"],
      where: progressWhere,
    }),
  ]);

  let attendanceAttended = 0;
  let attendanceTotal = 0;
  for (const group of attendanceGroups) {
    attendanceTotal += group._count._all;
    if (group.status === "PRESENT" || group.status === "LATE") {
      attendanceAttended += group._count._all;
    }
  }

  // Same rules as GET /dashboards/at-risk, counted per student. Academic scope: fees never count here.
  const atRiskRows = await computeAtRisk({ id: "academic-dashboard", role: "ACADEMIC_ADMIN" }, filter);
  const atRiskStudents = new Set(atRiskRows.map((row) => row.student.id)).size;

  return {
    totalStudents,
    activeStudents,
    newRegistrations,
    completed,
    withdrawn,
    byLevel: byLevelGroups.map((group) => ({ levelId: group.levelId, count: group._count._all })),
    byCampus: byCampusGroups.map((group) => ({
      campusId: group.campusId,
      count: group._count._all,
    })),
    byIntake: byIntakeGroups.map((group) => ({
      intakeId: group.intakeId,
      count: group._count._all,
    })),
    averageScore: round2(Number(attemptAggregate._avg.score ?? 0)),
    completionRate: percentage(progressGroups.length, totalStudents),
    attendanceRate: percentage(attendanceAttended, attendanceTotal),
    passRate: percentage(passedCount, gradedCount),
    atRiskStudents,
  };
};
