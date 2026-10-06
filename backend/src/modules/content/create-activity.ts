import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
CreateActivityInput
} from "./content.schema.js";
import { levelIdOfLesson } from './level-id-of-lesson.js';
import { toJsonInput } from './to-json-input.js';
export const createActivity = async (
  lessonId: string,
  input: CreateActivityInput,
  actor: ContentActor,
) => {
  await assertCanManageLevel(actor, await levelIdOfLesson(lessonId));

  const created = await prisma.activity.create({
    data: {
      lessonId,
      title: input.title,
      type: input.type,
      instructions: input.instructions ?? null,
      order: input.order ?? 0,
      isPublished: input.isPublished ?? false,
      config: toJsonInput(input.config),
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_CREATED",
    entityType: "Activity",
    entityId: created.id,
    after: created,
  });
  return created;
};
