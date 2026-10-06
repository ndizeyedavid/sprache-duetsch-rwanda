import { prisma } from "../../lib/prisma.js";
export const uniqueSlug = async (base: string, ignoreId?: string): Promise<string> => {
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
