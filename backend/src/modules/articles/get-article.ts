import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { authorSelect } from './author-select.js';
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
