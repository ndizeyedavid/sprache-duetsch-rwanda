import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
UpdateModuleInput
} from "./content.schema.js";
export const updateModule = async (id: string, input: UpdateModuleInput, actor: ContentActor) => {
  const before = await prisma.module.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Module not found");
  }
  await assertCanManageLevel(actor, before.levelId);

  const updated = await prisma.module.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      order: input.order,
      isPublished: input.isPublished,
      releaseAt: input.releaseAt,
      prerequisiteModuleId: input.prerequisiteModuleId,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MODULE_UPDATED",
    entityType: "Module",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};
