import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
UpdateActivityInput
} from "./content.schema.js";
import { levelIdOfLesson } from './level-id-of-lesson.js';
import { toJsonInput } from './to-json-input.js';
export const updateActivity = async (
  id: string,
  input: UpdateActivityInput,
  actor: ContentActor,
) => {
  const before = await prisma.activity.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Activity not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      title: input.title,
      type: input.type,
      instructions: input.instructions,
      order: input.order,
      isPublished: input.isPublished,
      config: toJsonInput(input.config),
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_UPDATED",
    entityType: "Activity",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};
