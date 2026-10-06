import { env } from "../../config/env.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { DashboardFilter } from "./dashboards.schema.js";
import { emptyStudentScope } from './empty-student-scope.js';
import { percentage } from './percentage.js';
import { round2 } from './round2.js';
export const getAcademicDashboard = async (filter: DashboardFilter) => {
  const studentScope = emptyStudentScope(filter);

  const attemptWhere: Prisma.AttemptWhereInput = { status: "GRADED" };
  if (filter.levelId) attemptWhere.assessment = { levelId: filter.levelId };
  const attemptStudentScope: Prisma.StudentWhereInput = {};
  if (filter.campusId) attemptStudentScope.campusId = filter.campusId;
  if (filter.intakeId) attemptStudentScope.intakeId = filter.intakeId;
  if (Object.keys(attemptStudentScope).length > 0) attemptWhere.student = attemptStudentScope;

  const attendanceWhere: Prisma.AttendanceWhereInput = {};
  if (filter.levelId) attendanceWhere.session = { classGroup: { levelId: filter.levelId } };
  const attendanceStudentScope: Prisma.StudentWhereInput = {};
  if (filter.campusId) attendanceStudentScope.campusId = filter.campusId;
  if (filter.intakeId) attendanceStudentScope.intakeId = filter.intakeId;
  if (Object.keys(attendanceStudentScope).length > 0) {
    attendanceWhere.student = attendanceStudentScope;
  }

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

  // At-risk: active students below the attendance threshold OR averaging under 50.
  const activeRows = await prisma.student.findMany({
    where: { ...studentScope, status: "ACTIVE" },
    select: { id: true },
  });
  const activeIds = activeRows.map((row) => row.id);

  let atRiskStudents = 0;
  if (activeIds.length > 0) {
    const [attendanceByStudent, scoreByStudent] = await Promise.all([
      prisma.attendance.groupBy({
        by: ["studentId", "status"],
        where: { studentId: { in: activeIds } },
        _count: { _all: true },
      }),
      prisma.attempt.groupBy({
        by: ["studentId"],
        where: { studentId: { in: activeIds }, status: "GRADED", score: { not: null } },
        _avg: { score: true },
      }),
    ]);

    const attendanceMap = new Map<string, { attended: number; total: number }>();
    for (const group of attendanceByStudent) {
      const entry = attendanceMap.get(group.studentId) ?? { attended: 0, total: 0 };
      entry.total += group._count._all;
      if (group.status === "PRESENT" || group.status === "LATE")
        entry.attended += group._count._all;
      attendanceMap.set(group.studentId, entry);
    }
    const scoreMap = new Map(
      scoreByStudent.map((group) => [
        group.studentId,
        group._avg.score === null ? null : Number(group._avg.score),
      ]),
    );

    for (const id of activeIds) {
      const attendance = attendanceMap.get(id);
      const rate =
        attendance && attendance.total > 0 ? (attendance.attended / attendance.total) * 100 : null;
      const average = scoreMap.get(id) ?? null;
      if (
        (rate !== null && rate < env.ATTENDANCE_ALERT_THRESHOLD) ||
        (average !== null && average < 50)
      ) {
        atRiskStudents += 1;
      }
    }
  }

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
