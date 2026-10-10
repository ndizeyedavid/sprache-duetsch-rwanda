import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import { levelIdOfLesson } from './level-id-of-lesson.js';
export const deleteActivity = async (id: string, actor: ContentActor) => {
  const before = await prisma.activity.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Activity not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));
  await prisma.activity.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_DELETED",
    entityType: "Activity",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};
