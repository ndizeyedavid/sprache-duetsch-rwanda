import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const deleteFaq = async (id: string, actorId: string | undefined) => {
  const before = await prisma.faq.findUnique({ where: { id } });
  if (!before) {
    throw notFound("FAQ not found");
  }
  await prisma.faq.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "FAQ_DELETED",
    entityType: "Faq",
    entityId: id,
    before,
  });

  return { message: "FAQ deleted" };
};
