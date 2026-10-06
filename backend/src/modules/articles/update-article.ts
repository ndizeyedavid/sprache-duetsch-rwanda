import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateArticleInput
} from "./articles.schema.js";
import { authorSelect } from './author-select.js';
import { slugify } from './slugify.js';
import { uniqueSlug } from './unique-slug.js';
export const updateArticle = async (
  id: string,
  actorId: string | undefined,
  input: UpdateArticleInput,
) => {
  const before = await prisma.article.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Article not found");
  }

  let slug = before.slug;
  if (input.slug && input.slug !== before.slug) {
    slug = await uniqueSlug(input.slug, id);
  } else if (input.title && !input.slug) {
    slug = await uniqueSlug(slugify(input.title), id);
  }

  const publishing = input.isPublished === true && !before.isPublished;

  const article = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      coverImageUrl: input.coverImageUrl,
      isPublished: input.isPublished,
      publishedAt: publishing ? new Date() : before.publishedAt,
    },
    include: { author: authorSelect },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ARTICLE_UPDATED",
    entityType: "Article",
    entityId: id,
    before,
    after: article,
  });

  return article;
};
