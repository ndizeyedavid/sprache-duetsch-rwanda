import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import { levelIdOfLesson } from './level-id-of-lesson.js';
export const deleteMaterial = async (id: string, actor: ContentActor) => {
  const before = await prisma.lessonMaterial.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Material not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));
  await prisma.lessonMaterial.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "MATERIAL_DELETED",
    entityType: "LessonMaterial",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};
