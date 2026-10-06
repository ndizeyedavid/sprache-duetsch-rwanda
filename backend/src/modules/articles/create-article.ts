import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import type {
CreateArticleInput
} from "./articles.schema.js";
import { authorSelect } from './author-select.js';
import { slugify } from './slugify.js';
import { uniqueSlug } from './unique-slug.js';
export const createArticle = async (authorId: string | undefined, input: CreateArticleInput) => {
  const base = input.slug ?? slugify(input.title);
  const slug = await uniqueSlug(base);

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      body: input.body,
      coverImageUrl: input.coverImageUrl ?? null,
      authorId: authorId ?? null,
      isPublished: input.isPublished ?? false,
      publishedAt: input.isPublished ? new Date() : null,
    },
    include: { author: authorSelect },
  });

  await writeAudit({
    actorId: authorId ?? null,
    action: "ARTICLE_CREATED",
    entityType: "Article",
    entityId: article.id,
    after: article,
  });

  return article;
};
