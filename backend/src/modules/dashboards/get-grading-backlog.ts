import { prisma } from "../../lib/prisma.js";
import type { GradingBacklogQuery } from "./analytics.schema.js";
import type { AnalyticsActor } from "./at-risk-scope.js";
import { loadBacklogItems } from "./backlog-data.js";
import { summariseBacklog } from "./backlog-math.js";

const unique = <T>(values: T[]) => [...new Set(values)];

/**
 * Per teacher: ungraded homework (their classes), manual-grading attempts and non-practice activity
 * submissions (their students at their class levels), oldest wait and 30-day median turnaround.
 * Teachers only ever get their own row.
 */
export async function getGradingBacklog(actor: AnalyticsActor, query: GradingBacklogQuery, now = new Date()) {
  const teacherId = actor.role === "TEACHER" ? actor.id : query.teacherId;
  const classes = await prisma.classGroup.findMany({ where: { isActive: true, teacherId: teacherId ?? { not: null }, ...(query.intakeId ? { intakeId: query.intakeId } : {}) },
    select: { id: true, levelId: true, teacherId: true, enrollments: { where: { status: "ACTIVE" }, select: { studentId: true } } } });
  const classTeacherIds = unique(classes.flatMap(c => (c.teacherId ? [c.teacherId] : [])));
  const teachers = await prisma.user.findMany({
    // With an intake selected, only teachers who have classes in it are listed.
    where: { role: "TEACHER", ...(teacherId ? { id: teacherId } : query.intakeId ? { id: { in: classTeacherIds } } : { OR: [{ status: "ACTIVE" }, { id: { in: classTeacherIds } }] }) },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  if (!teachers.length) return [];
  const items = await loadBacklogItems({
    classIds: classes.map(c => c.id), levelIds: unique(classes.map(c => c.levelId)),
    studentIds: unique(classes.flatMap(c => c.enrollments.map(e => e.studentId))), teacherIds: teachers.map(t => t.id),
  }, new Date(now.getTime() - 30 * 86_400_000));
  return teachers.map(teacher => {
    const own = classes.filter(c => c.teacherId === teacher.id);
    const classIds = new Set(own.map(c => c.id));
    const pairs = new Set(own.flatMap(c => c.enrollments.map(e => `${e.studentId}:${c.levelId}`)));
    const homework = items.homework.filter(row => classIds.has(row.classGroupId));
    const attempts = items.attempts.filter(row => pairs.has(`${row.studentId}:${row.levelId}`));
    const activities = items.activities.filter(row => pairs.has(`${row.studentId}:${row.levelId}`));
    const reviewed = [...items.reviewedHomework.filter(row => classIds.has(row.classGroupId)), ...items.reviewedByGrader.filter(row => row.gradedById === teacher.id)];
    const waiting = [...homework, ...attempts, ...activities].map(row => row.submittedAt);
    return {
      teacher, classCount: own.length,
      homework: homework.length, attempts: attempts.length, activities: activities.length, total: waiting.length,
      ...summariseBacklog(waiting, reviewed, now),
    };
  }).sort((a, b) => b.total - a.total || (b.oldestWaitingHours ?? 0) - (a.oldestWaitingHours ?? 0));
}
