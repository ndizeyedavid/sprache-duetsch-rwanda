import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateFaqInput
} from "./articles.schema.js";
export const updateFaq = async (id: string, actorId: string | undefined, input: UpdateFaqInput) => {
  const before = await prisma.faq.findUnique({ where: { id } });
  if (!before) {
    throw notFound("FAQ not found");
  }
  const faq = await prisma.faq.update({ where: { id }, data: { ...input } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "FAQ_UPDATED",
    entityType: "Faq",
    entityId: id,
    before,
    after: faq,
  });

  return faq;
};
