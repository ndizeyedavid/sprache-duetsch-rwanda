import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListArticlesQuery
} from "./articles.schema.js";
import { authorSelect } from './author-select.js';
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
