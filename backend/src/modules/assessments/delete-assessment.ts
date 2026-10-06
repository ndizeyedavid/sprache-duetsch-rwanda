import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const deleteAssessment = async (id: string, actorId?: string) => {
  const before = await prisma.assessment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Assessment not found");
  }

  await prisma.assessment.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_DELETED",
    entityType: "Assessment",
    entityId: id,
    before,
  });

  return { id };
};
