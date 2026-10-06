import { recalculateStudentFinance } from "../../lib/finance.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { DashboardFilter } from "./dashboards.schema.js";
import { percentage } from './percentage.js';
import { ZERO } from './zero.js';
export const getStudentDashboard = async (userId: string, _filter: DashboardFilter) => {
  const financeStudent = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (financeStudent) await recalculateStudentFinance(prisma, financeStudent.id);
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
