import { prisma } from "../../lib/prisma.js";
import { loadScheduleAccess,protectStudentSession } from "./session-access.js";
import { studentSessionSelect } from './student-session-select.js';
export const getMyUpcomingSessions = async (userId: string) => {
  const profile = await loadScheduleAccess(userId);
  if (profile.classGroupIds.length === 0) {
    return [];
  }

  const rows = await prisma.classSession.findMany({
    where: {
      classGroupId: { in: profile.classGroupIds },
      endAt: { gt: new Date() },
      status: { in: ["SCHEDULED", "LIVE", "RESCHEDULED"] },
    },
    orderBy: { startAt: "asc" },
    select: studentSessionSelect,
  });
  return rows.map(row => protectStudentSession(row, profile));
};
