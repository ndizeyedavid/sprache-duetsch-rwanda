import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const deleteArticle = async (id: string, actorId: string | undefined) => {
  const before = await prisma.article.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Article not found");
  }
  await prisma.article.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ARTICLE_DELETED",
    entityType: "Article",
    entityId: id,
    before,
  });

  return { message: "Article deleted" };
};
