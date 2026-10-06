import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!user) {
    throw notFound("User not found");
  }
  return user;
};
