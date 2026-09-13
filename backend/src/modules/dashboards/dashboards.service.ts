import { Prisma } from "../../generated/prisma/client.js";
import type { Role } from "../../generated/prisma/client.js";
import { env } from "../../config/env.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { DashboardFilter } from "./dashboards.schema.js";

const ZERO = new Prisma.Decimal(0);

const round2 = (value: number): number => Math.round(value * 100) / 100;

const percentage = (numerator: number, denominator: number): number =>
  denominator > 0 ? round2((numerator / denominator) * 100) : 0;

// ---------------------------------------------------------------------------
// Shared filter builders
// ---------------------------------------------------------------------------

const emptyStudentScope = (filter: DashboardFilter): Prisma.StudentWhereInput => {
  const where: Prisma.StudentWhereInput = {};
  if (filter.campusId) where.campusId = filter.campusId;
  if (filter.intakeId) where.intakeId = filter.intakeId;
  if (filter.levelId) {
    where.enrollments = { some: { levelId: filter.levelId, status: "ACTIVE" } };
  }
  return where;
};

const courseScope = (filter: DashboardFilter): Prisma.ClassGroupWhereInput => {
  const where: Prisma.ClassGroupWhereInput = {};
  if (filter.levelId) where.levelId = filter.levelId;
  if (filter.intakeId) where.intakeId = filter.intakeId;
  if (filter.campusId) where.campusId = filter.campusId;
  if (filter.teacherId) where.teacherId = filter.teacherId;
  return where;
};

// ---------------------------------------------------------------------------
// Student dashboard
// ---------------------------------------------------------------------------

export const getStudentDashboard = async (userId: string, _filter: DashboardFilter) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
      campus: { select: { id: true, code: true, name: true } },
      intake: { select: { id: true, code: true, name: true } },
      currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      finance: {
        select: { totalDue: true, totalPaid: true, balance: true, status: true, currency: true },
      },
      enrollments: {
        where: { status: "ACTIVE" },
        select: {
          levelId: true,
          classGroupId: true,
          classGroup: { select: { id: true, code: true, name: true, shift: true } },
        },
      },
    },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  const levelIds = new Set<string>();
  if (student.currentLevel) levelIds.add(student.currentLevel.id);
  for (const enrollment of student.enrollments) levelIds.add(enrollment.levelId);
  const levels = [...levelIds];

  const classGroupIds = student.enrollments
    .map((enrollment) => enrollment.classGroupId)
    .filter((id): id is string => id !== null);
  const classGroup = student.enrollments.find((e) => e.classGroup)?.classGroup ?? null;

  const now = new Date();
  const currentLevelId = student.currentLevel?.id ?? null;

  const [
    lessonsTotal,
    lessonsCompleted,
    nextLesson,
    upcomingClass,
    nextExam,
    attendanceGroups,
    unread,
  ] = await Promise.all([
    levels.length > 0
      ? prisma.lesson.count({
          where: { isPublished: true, module: { levelId: { in: levels } } },
        })
      : Promise.resolve(0),
    levels.length > 0
      ? prisma.lessonProgress.count({
          where: {
            studentId: student.id,
            status: "COMPLETED",
            lesson: { isPublished: true, module: { levelId: { in: levels } } },
          },
        })
      : Promise.resolve(0),
    currentLevelId
      ? prisma.lesson.findFirst({
          where: {
            isPublished: true,
            module: { levelId: currentLevelId, isPublished: true },
            progress: { none: { studentId: student.id, status: "COMPLETED" } },
          },
          orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
          select: {
            id: true,
            title: true,
            order: true,
            contentType: true,
            estimatedMinutes: true,
            module: { select: { id: true, title: true, order: true } },
          },
        })
      : Promise.resolve(null),
    classGroupIds.length > 0
      ? prisma.classSession.findFirst({
          where: {
            classGroupId: { in: classGroupIds },
            status: { in: ["SCHEDULED", "LIVE"] },
            startAt: { gte: now },
          },
          orderBy: { startAt: "asc" },
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            status: true,
            meetingUrl: true,
            classGroup: { select: { id: true, code: true, name: true } },
          },
        })
      : Promise.resolve(null),
    levels.length > 0
      ? prisma.assessment.findFirst({
          where: {
            isPublished: true,
            levelId: { in: levels },
            availableUntil: { gte: now },
          },
          orderBy: { availableFrom: "asc" },
          select: {
            id: true,
            title: true,
            type: true,
            levelId: true,
            availableFrom: true,
            availableUntil: true,
          },
        })
      : Promise.resolve(null),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { studentId: student.id },
      _count: { _all: true },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  const attendance = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const group of attendanceGroups) {
    if (group.status === "PRESENT") attendance.present = group._count._all;
    else if (group.status === "ABSENT") attendance.absent = group._count._all;
    else if (group.status === "LATE") attendance.late = group._count._all;
    else if (group.status === "EXCUSED") attendance.excused = group._count._all;
  }
  const attendanceTotal =
    attendance.present + attendance.absent + attendance.late + attendance.excused;

  const finance = student.finance ?? {
    totalDue: ZERO,
    totalPaid: ZERO,
    balance: ZERO,
    status: "UNPAID" as const,
    currency: "RWF",
  };

  return {
    currentLevel: student.currentLevel,
    intake: student.intake,
    campus: student.campus,
    classGroup,
    progress: {
      lessonsCompleted,
      lessonsTotal,
      completionPercentage: percentage(lessonsCompleted, lessonsTotal),
    },
    nextLesson,
    upcomingClass,
    nextExam,
    attendance: {
      percentage: percentage(attendance.present + attendance.late, attendanceTotal),
      present: attendance.present,
      absent: attendance.absent,
      late: attendance.late,
      excused: attendance.excused,
    },
    finance: {
      totalDue: finance.totalDue,
      totalPaid: finance.totalPaid,
      balance: finance.balance,
      status: finance.status,
      currency: finance.currency,
    },
    unreadNotificationsCount: unread,
  };
};

// ---------------------------------------------------------------------------
// Teacher dashboard
// ---------------------------------------------------------------------------

export const getTeacherDashboard = async (userId: string, role: Role, filter: DashboardFilter) => {
  const classWhere = courseScope(filter);
  // Teachers only ever see their own classes; admins may narrow by teacherId.
  if (role === "TEACHER") {
    classWhere.teacherId = userId;
  }

  const classes = await prisma.classGroup.findMany({
    where: classWhere,
    select: { id: true, levelId: true },
  });

  const classIds = classes.map((classGroup) => classGroup.id);
  const levelIds = [...new Set(classes.map((classGroup) => classGroup.levelId))];

  if (classIds.length === 0) {
    return {
      classesCount: 0,
      studentsCount: 0,
      upcomingSessionsCount: 0,
      pendingGradingCount: 0,
      sessionsToday: [],
      recentAssessments: [],
    };
  }

  const now = new Date();

  let rangeStart: Date;
  let rangeEnd: Date;
  if (filter.from || filter.to) {
    rangeStart = filter.from ?? new Date(0);
    rangeEnd = filter.to ?? new Date(8640000000000000);
  } else {
    rangeStart = new Date(now);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 1);
  }

  const [
    studentGroups,
    upcomingSessionsCount,
    pendingGradingCount,
    sessionsToday,
    recentAssessments,
  ] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["studentId"],
      where: { classGroupId: { in: classIds }, status: "ACTIVE" },
    }),
    prisma.classSession.count({
      where: {
        classGroupId: { in: classIds },
        status: { in: ["SCHEDULED", "LIVE"] },
        startAt: { gte: now },
      },
    }),
    prisma.attempt.count({
      where: { status: "SUBMITTED", assessment: { levelId: { in: levelIds } } },
    }),
    prisma.classSession.findMany({
      where: {
        classGroupId: { in: classIds },
        startAt: { gte: rangeStart, lt: rangeEnd },
      },
      orderBy: { startAt: "asc" },
      take: 20,
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        status: true,
        classGroup: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.assessment.findMany({
      where: { isPublished: true, levelId: { in: levelIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, type: true, levelId: true, createdAt: true },
    }),
  ]);

  return {
    classesCount: classIds.length,
    studentsCount: studentGroups.length,
    upcomingSessionsCount,
    pendingGradingCount,
    sessionsToday,
    recentAssessments,
  };
};

// ---------------------------------------------------------------------------
// Academic dashboard
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Finance dashboard
// ---------------------------------------------------------------------------

interface MoneyBucket {
  billed: Prisma.Decimal;
  collected: Prisma.Decimal;
}

const addMoney = (
  map: Map<string, MoneyBucket>,
  key: string | null,
  due: Prisma.Decimal,
  paid: Prisma.Decimal,
): void => {
  const bucketKey = key ?? "UNASSIGNED";
  const bucket = map.get(bucketKey) ?? { billed: ZERO, collected: ZERO };
  bucket.billed = bucket.billed.plus(due);
  bucket.collected = bucket.collected.plus(paid);
  map.set(bucketKey, bucket);
};

export const getFinanceDashboard = async (filter: DashboardFilter) => {
  const studentScope = emptyStudentScope(filter);
  const hasScope = Object.keys(studentScope).length > 0;

  const financeWhere: Prisma.StudentFinanceWhereInput = hasScope ? { student: studentScope } : {};
  const finances = await prisma.studentFinance.findMany({
    where: financeWhere,
    select: {
      totalDue: true,
      totalPaid: true,
      balance: true,
      status: true,
      student: { select: { campusId: true, intakeId: true, currentLevelId: true } },
    },
  });

  let totalBilled = ZERO;
  let totalCollected = ZERO;
  let totalOutstanding = ZERO;
  let overdueCount = 0;
  const byLevelMap = new Map<string, MoneyBucket>();
  const byIntakeMap = new Map<string, MoneyBucket>();
  const byCampusMap = new Map<string, MoneyBucket>();

  for (const row of finances) {
    totalBilled = totalBilled.plus(row.totalDue);
    totalCollected = totalCollected.plus(row.totalPaid);
    totalOutstanding = totalOutstanding.plus(row.balance);
    if (row.status === "OVERDUE") overdueCount += 1;

    addMoney(byLevelMap, row.student.currentLevelId, row.totalDue, row.totalPaid);
    addMoney(byIntakeMap, row.student.intakeId, row.totalDue, row.totalPaid);
    addMoney(byCampusMap, row.student.campusId, row.totalDue, row.totalPaid);
  }

  const paymentWhere: Prisma.PaymentWhereInput = { txnType: "PAYMENT" };
  if (hasScope) paymentWhere.student = studentScope;
  const methodGroups = await prisma.payment.groupBy({
    by: ["methodId"],
    where: paymentWhere,
    _sum: { amount: true },
  });
  const methodRows = await prisma.paymentMethodConfig.findMany({
    where: { id: { in: methodGroups.map((group) => group.methodId) } },
    select: { id: true, name: true },
  });
  const methodNames = new Map(methodRows.map((method) => [method.id, method.name]));

  const mapBuckets = (map: Map<string, MoneyBucket>) =>
    [...map.entries()].map(([key, bucket]) => ({
      key,
      billed: bucket.billed,
      collected: bucket.collected,
    }));

  return {
    totalBilled,
    totalCollected,
    totalOutstanding,
    collectionRate: percentage(Number(totalCollected), Number(totalBilled)),
    byLevel: mapBuckets(byLevelMap),
    byIntake: mapBuckets(byIntakeMap),
    byCampus: mapBuckets(byCampusMap),
    byPaymentMethod: methodGroups.map((group) => ({
      methodId: group.methodId,
      name: methodNames.get(group.methodId) ?? null,
      total: group._sum.amount ?? ZERO,
    })),
    overdueCount,
  };
};

// ---------------------------------------------------------------------------
// Management dashboard (super admin)
// ---------------------------------------------------------------------------

export const getManagementDashboard = async (filter: DashboardFilter) => {
  const [academic, finance] = await Promise.all([
    getAcademicDashboard(filter),
    getFinanceDashboard(filter),
  ]);

  const notificationWhere: Prisma.NotificationWhereInput = { type: "ANNOUNCEMENT" };
  if (filter.from || filter.to) {
    notificationWhere.createdAt = { gte: filter.from, lte: filter.to };
  }

  const sessionWhere: Prisma.ClassSessionWhereInput = {};
  const classWhere = courseScope(filter);
  if (Object.keys(classWhere).length > 0) sessionWhere.classGroup = classWhere;

  const liveSessions = { scheduled: 0, live: 0, completed: 0, cancelled: 0, rescheduled: 0 };

  const [notificationsSent, sessionGroups] = await Promise.all([
    prisma.notification.count({ where: notificationWhere }),
    prisma.classSession.groupBy({
      by: ["status"],
      where: sessionWhere,
      _count: { _all: true },
    }),
  ]);

  for (const group of sessionGroups) {
    if (group.status === "SCHEDULED") liveSessions.scheduled = group._count._all;
    else if (group.status === "LIVE") liveSessions.live = group._count._all;
    else if (group.status === "COMPLETED") liveSessions.completed = group._count._all;
    else if (group.status === "CANCELLED") liveSessions.cancelled = group._count._all;
    else if (group.status === "RESCHEDULED") liveSessions.rescheduled = group._count._all;
  }

  return { academic, finance, notificationsSent, liveSessions };
};
