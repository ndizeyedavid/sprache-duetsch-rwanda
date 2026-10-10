import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import { levelIdOfLesson } from './level-id-of-lesson.js';
export const deleteLesson = async (id: string, actor: ContentActor) => {
  const before = await prisma.lesson.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Lesson not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(id));
  await prisma.lesson.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "LESSON_DELETED",
    entityType: "Lesson",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};
