import type { Prisma } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { getTeacherLevelIds } from "../../lib/teacher-levels.js";
import type { ContentActor } from './content-actor.js';
import type {
ListActivitySubmissionsQuery
} from "./content.schema.js";
import { getPracticeActivityIds } from "./practice.utils.js";
export const listActivitySubmissions = async (actor: ContentActor, query: ListActivitySubmissionsQuery) => {
  const pagination = parsePagination(query);
  const where: Prisma.ActivitySubmissionWhereInput = { AND: [{ activityId: { notIn: await getPracticeActivityIds() } }] };
  if (query.activityId) where.activityId = query.activityId;
  if (query.studentId) where.studentId = query.studentId;
  if (query.status) where.status = query.status;
  if (query.lessonId) where.activity = { lessonId: query.lessonId };

  // Scope teachers to their levels
  if (actor.role === 'TEACHER' && actor.id) {
    const levelIds = await getTeacherLevelIds(actor.id);
    where.student = { enrollments: { some: { status: "ACTIVE", classGroup: { teacherId: actor.id } } } };
    if (levelIds.length === 0) return buildPaginated([], 0, pagination);
    // filter lessons whose module levelId in levelIds
    where.activity = { ...(query.lessonId ? { lessonId: query.lessonId } : {}), lesson: { module: { levelId: { in: levelIds } } } };
    if (query.lessonId) {
      // also verify requested lesson is in teacher's levels
      const lesson = await prisma.lesson.findUnique({ where: { id: query.lessonId }, select: { module: { select: { levelId: true } } } });
      if (!lesson || !levelIds.includes(lesson.module.levelId)) throw notFound("Lesson not found or not in your levels");
    }
  }

  const [rows, total] = await prisma.$transaction([
    prisma.activitySubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        activity: { select: { id: true, title: true, type: true, lessonId: true, lesson: { select: { id: true, title: true, module: { select: { levelId: true, level: { select: { code: true } } } } } } } },
        student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    }),
    prisma.activitySubmission.count({ where }),
  ]);
  return buildPaginated(rows, total, pagination);
};
