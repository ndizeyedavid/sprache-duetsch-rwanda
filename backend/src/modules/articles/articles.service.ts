import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateArticleInput,
  CreateFaqInput,
  ListArticlesQuery,
  UpdateArticleInput,
  UpdateFaqInput,
} from "./articles.schema.js";

const slugify = (title: string): string =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "article";

const uniqueSlug = async (base: string, ignoreId?: string): Promise<string> => {
  let slug = base;
  let suffix = 2;
  for (;;) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === ignoreId) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

const authorSelect = { select: { id: true, firstName: true, lastName: true } } as const;

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const listArticles = async (query: ListArticlesQuery, includeDrafts: boolean) => {
  const pagination = parsePagination(query);

  const where: Prisma.ArticleWhereInput = {};
  if (!includeDrafts || query.published === true) {
    where.isPublished = true;
  } else if (query.published === false) {
    where.isPublished = false;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { excerpt: { contains: query.search, mode: "insensitive" } },
      { body: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      include: { author: authorSelect },
    }),
    prisma.article.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getArticle = async (slug: string, includeDrafts: boolean) => {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: authorSelect },
  });
  if (!article) {
    throw notFound("Article not found");
  }
  if (!article.isPublished && !includeDrafts) {
    throw notFound("Article not found");
  }
  return article;
};

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

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export const listFaqs = async (includeDrafts: boolean) => {
  return prisma.faq.findMany({
    where: includeDrafts ? {} : { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
};

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
