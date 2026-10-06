import type { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";
import { parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { assertMembership } from './assert-membership.js';
import type {
ListMessagesQuery
} from "./messages.schema.js";
export const listMessages = async (userId: string, conversationId: string, query: ListMessagesQuery) => {
  await assertMembership(conversationId, userId);
  const pagination = parsePagination(query, { defaultPageSize: 50 });

  const where: Prisma.MessageWhereInput = { conversationId };
  if (query.before) {
    const cursor = await prisma.message.findUnique({
      where: { id: query.before },
      select: { createdAt: true, conversationId: true },
    });
    if (!cursor || cursor.conversationId !== conversationId) {
      throw badRequest("Invalid message cursor");
    }
    where.createdAt = { lt: cursor.createdAt };
  }

  const rows = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: pagination.take,
    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
  });

  return rows.reverse();
};
