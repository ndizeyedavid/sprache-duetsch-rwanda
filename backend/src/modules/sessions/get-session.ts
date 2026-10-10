import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { briefTeacher } from './brief-teacher.js';
import { classGroupDetailSelect } from './class-group-detail-select.js';
export const getSession = async (id: string) => {
  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      classGroup: { select: classGroupDetailSelect },
      teacher: briefTeacher,
      materials: { orderBy: { createdAt: "desc" } },
      attendance: {
        select: {
          id: true,
          status: true,
          note: true,
          markedAt: true,
          student: {
            select: {
              id: true,
              studentCode: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw notFound("Session not found");
  }

  return session;
};
