import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
CreateModuleInput
} from "./content.schema.js";
export const createModule = async (
  levelId: string,
  input: CreateModuleInput,
  actor: ContentActor,
) => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw notFound("Level not found");
  }
  await assertCanManageLevel(actor, levelId);

  let order = input.order;
  if (order === undefined) {
    const last = await prisma.module.findFirst({ where: { levelId }, orderBy: { order: "desc" }, select: { order: true } });
    order = last ? last.order + 1 : 0;
  }

  let created: Awaited<ReturnType<typeof prisma.module.create>>;
  try {
    created = await prisma.module.create({
      data: {
        levelId,
        title: input.title,
        description: input.description ?? null,
        order: order,
        isPublished: input.isPublished ?? false,
        releaseAt: input.releaseAt ?? null,
        prerequisiteModuleId: input.prerequisiteModuleId ?? null,
      },
    });
  } catch (e) {
    // P2002 unique [levelId, order] — auto-bump to next free slot
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const last = await prisma.module.findFirst({ where: { levelId }, orderBy: { order: "desc" }, select: { order: true } });
      const nextOrder = last ? last.order + 1 : 0;
      created = await prisma.module.create({
        data: {
          levelId,
          title: input.title,
          description: input.description ?? null,
          order: nextOrder,
          isPublished: input.isPublished ?? false,
          releaseAt: input.releaseAt ?? null,
          prerequisiteModuleId: input.prerequisiteModuleId ?? null,
        },
      });
    } else throw e;
  }

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MODULE_CREATED",
    entityType: "Module",
    entityId: created.id,
    after: created,
  });
  return created;
};
