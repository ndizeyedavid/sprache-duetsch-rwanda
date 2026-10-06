import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatarUrl: true,
      lastLoginAt: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          studentCode: true,
          status: true,
          shift: true,
          campus: { select: { id: true, code: true, name: true } },
          intake: { select: { id: true, code: true, name: true } },
          intendedLevel: { select: { id: true, code: true, title: true } },
          currentLevel: { select: { id: true, code: true, title: true } },
          finance: {
            select: { totalDue: true, totalPaid: true, balance: true, currency: true, status: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw notFound("User not found");
  }

  return user;
};
