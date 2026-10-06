import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { briefTeacher } from './brief-teacher.js';
import { classGroupDetailSelect } from './class-group-detail-select.js';
import { loadScheduleAccess,protectStudentSession } from "./session-access.js";
export const getMySession = async (userId: string, id: string) => {
  const profile = await loadScheduleAccess(userId);

  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      teacher: briefTeacher,
      classGroup: { select: classGroupDetailSelect },
      materials: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  if (!profile.classGroupIds.includes(session.classGroupId)) {
    throw forbidden("You do not have access to this session");
  }

  const protectedSession = protectStudentSession(session, profile);
  return { ...protectedSession, materials: protectedSession.accessMessage ? [] : session.materials };
};
