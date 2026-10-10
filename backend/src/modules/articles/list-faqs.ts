import { prisma } from "../../lib/prisma.js";
export const listFaqs = async (includeDrafts: boolean) => {
  return prisma.faq.findMany({
    where: includeDrafts ? {} : { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
};
