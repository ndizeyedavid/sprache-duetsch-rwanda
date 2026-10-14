import { prisma } from "../../lib/prisma.js";
import { getPracticeActivityIds } from "../content/practice.utils.js";

export interface TeachingScope { classIds: string[]; levelIds: string[]; studentIds: string[]; teacherIds: string[] }

/** Ungraded work + the last 30 days of reviews for the given classes/levels/students. */
export async function loadBacklogItems(scope: TeachingScope, since: Date) {
  const student = { in: scope.studentIds };
  const levelId = { in: scope.levelIds };
  const classGroupId = { in: scope.classIds };
  const practiceIds = await getPracticeActivityIds();
  const [homework, attempts, activities, reviewedHomework, reviewedAttempts, reviewedActivities] = await Promise.all([
    prisma.assignmentSubmission.findMany({ where: { status: "SUBMITTED", assignment: { classGroupId } },
      select: { submittedAt: true, assignment: { select: { classGroupId: true } } } }),
    prisma.attempt.findMany({ where: { status: "SUBMITTED", studentId: student, assessment: { levelId, type: { not: "PLACEMENT" } } },
      select: { studentId: true, submittedAt: true, assessment: { select: { levelId: true } } } }),
    prisma.activitySubmission.findMany({ where: { status: "SUBMITTED", studentId: student, activityId: { notIn: practiceIds }, activity: { lesson: { module: { levelId } } } },
      select: { studentId: true, submittedAt: true, activity: { select: { lesson: { select: { module: { select: { levelId: true } } } } } } } }),
    prisma.assignmentSubmission.findMany({ where: { status: { in: ["GRADED", "RETURNED"] }, gradedAt: { gte: since }, assignment: { classGroupId } },
      select: { submittedAt: true, gradedAt: true, assignment: { select: { classGroupId: true } } } }),
    prisma.attempt.findMany({ where: { gradedById: { in: scope.teacherIds }, gradedAt: { gte: since } },
      select: { gradedById: true, submittedAt: true, gradedAt: true } }),
    prisma.activitySubmission.findMany({ where: { gradedById: { in: scope.teacherIds }, gradedAt: { gte: since } },
      select: { gradedById: true, submittedAt: true, gradedAt: true } }),
  ]);
  return {
    homework: homework.map(row => ({ classGroupId: row.assignment.classGroupId, submittedAt: row.submittedAt })),
    attempts: attempts.map(row => ({ studentId: row.studentId, levelId: row.assessment.levelId, submittedAt: row.submittedAt })),
    activities: activities.map(row => ({ studentId: row.studentId, levelId: row.activity.lesson.module.levelId, submittedAt: row.submittedAt })),
    reviewedHomework: reviewedHomework.map(row => ({ classGroupId: row.assignment.classGroupId, submittedAt: row.submittedAt, gradedAt: row.gradedAt })),
    reviewedByGrader: [...reviewedAttempts, ...reviewedActivities],
  };
}
