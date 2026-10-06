import type { Prisma } from "../../generated/prisma/client.js";
export const dateFilter = (from?: Date, to?: Date): Prisma.DateTimeFilter | undefined => {
  if (!from && !to) return undefined;
  const filter: Prisma.DateTimeFilter = {};
  if (from) filter.gte = from;
  if (to) filter.lte = to;
  return filter;
};
