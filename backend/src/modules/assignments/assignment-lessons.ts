import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../types/auth.js";
import { checkClass } from "./assignment-access.js";

/** Lessons a class's homework can practise: every lesson of the class's own level, in course order. */
export async function classLessons(actor: AuthUser, classGroupId: string) {
  const group = await checkClass(actor, classGroupId);
  return prisma.lesson.findMany({
    where: { module: { levelId: group.levelId } },
    select: { id: true, title: true, order: true, isPublished: true, module: { select: { id: true, title: true, order: true } } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });
}

/** Homework may only link to a lesson from the same level as its class. */
export async function checkLesson(lessonId: string | null, levelId: string): Promise<void> {
  if (!lessonId) return;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { module: { select: { levelId: true } } } });
  if (!lesson || lesson.module.levelId !== levelId) throw badRequest("Choose a lesson from this class's level");
}
