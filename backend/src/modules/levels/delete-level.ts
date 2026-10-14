import { writeAudit } from "../../lib/audit.js";
import { conflict,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

const countLabel = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const deleteLevel = async (id: string, actorId?: string) => {
  const found = await prisma.level.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true, classes: true, certificates: true } } },
  });
  if (!found) {
    throw notFound("Level not found");
  }

  // Enrollments, classes and certificates carry student and payment history, so they
  // must be moved or removed first. Curriculum content is deleted with the level.
  const { _count: usage, ...before } = found;
  const blockers = [
    usage.enrollments ? countLabel(usage.enrollments, "enrolment", "enrolments") : null,
    usage.classes ? countLabel(usage.classes, "class", "classes") : null,
    usage.certificates ? countLabel(usage.certificates, "certificate", "certificates") : null,
  ].filter((label): label is string => label !== null);
  if (blockers.length > 0) {
    const last = blockers.pop();
    const list = blockers.length > 0 ? `${blockers.join(", ")} and ${last}` : last;
    throw conflict(
      `${before.code} still has ${list}. Move or remove them before deleting this level.`,
      usage,
    );
  }

  // Modules cascade to lessons, materials, activities, submissions and progress.
  await prisma.$transaction([
    prisma.assessment.deleteMany({ where: { levelId: id } }),
    prisma.question.deleteMany({ where: { levelId: id } }),
    prisma.module.deleteMany({ where: { levelId: id } }),
    prisma.level.delete({ where: { id } }),
  ]);

  await writeAudit({
    actorId: actorId ?? null,
    action: "LEVEL_DELETED",
    entityType: "Level",
    entityId: before.id,
    before,
  });

  return { id: before.id, code: before.code };
};
