import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import type {
CreateFaqInput
} from "./articles.schema.js";
export const createFaq = async (actorId: string | undefined, input: CreateFaqInput) => {
  const faq = await prisma.faq.create({
    data: {
      question: input.question,
      answer: input.answer,
      order: input.order ?? 0,
      isPublished: input.isPublished ?? true,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "FAQ_CREATED",
    entityType: "Faq",
    entityId: faq.id,
    after: faq,
  });

  return faq;
};
