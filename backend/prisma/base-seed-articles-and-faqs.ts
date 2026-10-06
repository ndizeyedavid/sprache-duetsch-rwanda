import { prisma } from "../src/lib/prisma.js";
import { articles } from './base-articles.js';
import { faqs } from './base-faqs.js';
export const seedArticlesAndFaqs = async (params: { staffIds: Map<string, string> }) => {
  const authorId = params.staffIds.get("academic@sparch.rw") ?? null;

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        isPublished: article.isPublished,
        publishedAt: new Date(),
        authorId,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        isPublished: article.isPublished,
        publishedAt: new Date(),
        authorId,
      },
    });
  }

  await prisma.faq.deleteMany({});
  await prisma.faq.createMany({ data: faqs });
};
