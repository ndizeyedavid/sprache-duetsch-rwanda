import { assertLevelAccess } from "../../lib/access.js";
import { AppError, forbidden } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertTeacherLevel } from "../../lib/teacher-levels.js";
import type { AuthUser } from "../../types/auth.js";
import { assertLessonAvailable } from "../content/lesson-availability.js";

export async function assertFileAccess(user: AuthUser, name: string) {
  const file = await prisma.uploadedFile.findUnique({ where: { name } });
  if (file?.uploaderId === user.id || ["SUPER_ADMIN", "ACADEMIC_ADMIN"].includes(user.role)) return;
  if (user.role === "FINANCE_ADMIN") throw forbidden("Learning resources are unavailable to this role");
  const suffix = `/api/uploads/${name}`;
  const books = await prisma.level.findMany({ where: { coursebookUrl: { endsWith: suffix } }, select: { id: true } });
  for (const book of books) {
    try {
      if (user.role === "TEACHER") await assertTeacherLevel(user.id, book.id);
      else await assertLevelAccess(user.id, book.id);
      return;
    } catch (error) { if (!(error instanceof AppError) || error.statusCode !== 403) throw error; }
  }
  const lessons = await prisma.lesson.findMany({ where: { OR: [
    { videoUrl: { endsWith: suffix } }, { audioUrl: { endsWith: suffix } },
    { materials: { some: { url: { endsWith: suffix } } } }, { body: { contains: suffix } },
  ] }, select: { id: true, module: { select: { levelId: true } } } });
  for (const lesson of lessons) {
    try {
      if (user.role === "TEACHER") await assertTeacherLevel(user.id, lesson.module.levelId);
      else await assertLessonAvailable(user.id, lesson.id);
      return;
    } catch (error) { if (!(error instanceof AppError) || error.statusCode !== 403) throw error; }
  }
  const questions = await prisma.question.findMany({ where: { OR: [{ audioUrl: { endsWith: suffix } }, { imageUrl: { endsWith: suffix } }] },
    select: { levelId: true, assessments: { select: { assessment: { select: { isPublished: true, availableFrom: true } } } } } });
  for (const question of questions) {
    if (user.role === "TEACHER") {
      try { await assertTeacherLevel(user.id, question.levelId); return; }
      catch (error) { if (!(error instanceof AppError) || error.statusCode !== 403) throw error; }
      continue;
    }
    if (!question.assessments.some(row => row.assessment.isPublished && (!row.assessment.availableFrom || row.assessment.availableFrom <= new Date()))) continue;
    try { await assertLevelAccess(user.id, question.levelId); return; } catch (error) { if (!(error instanceof AppError) || error.statusCode !== 403) throw error; }
  }
  throw forbidden("You do not have access to this file");
}
