import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { joinAttendanceStatus } from "./attendance-policy.js";
import { loadScheduleAccess,protectStudentSession } from "./session-access.js";

type JoinResult = { recorded: boolean; status: string | null };

function joinedAt(now: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(now);
  } catch {
    return now.toISOString().slice(11, 16);
  }
}

/**
 * A student opening the class link marks them PRESENT (or LATE) for that session.
 * Only during the join window, only when the link is actually available to them, and never over
 * a mark that already exists — the teacher's register always wins and can still correct this one.
 */
export const recordStudentJoin = async (userId: string, sessionId: string, now = new Date()): Promise<JoinResult> => {
  const profile = await loadScheduleAccess(userId);
  const session = await prisma.classSession.findUnique({ where: { id: sessionId } });
  if (!session) throw notFound("Session not found");
  if (!profile.classGroupIds.includes(session.classGroupId)) throw forbidden("You do not have access to this session");
  if (!protectStudentSession(session, profile).meetingUrl) return { recorded: false, status: null };

  const status = joinAttendanceStatus(session, now);
  if (!status) return { recorded: false, status: null };

  const where = { sessionId_studentId: { sessionId, studentId: profile.studentId } };
  const existing = await prisma.attendance.findUnique({ where, select: { status: true } });
  if (existing) return { recorded: false, status: existing.status };
  try {
    await prisma.attendance.create({ data: {
      sessionId, studentId: profile.studentId, status, markedById: userId, markedAt: now,
      note: `Joined via class link at ${joinedAt(now, session.timezone)}`,
    } });
  } catch (error) {
    // A double click or a teacher marking at the same moment: keep whichever landed first.
    if ((error as { code?: string }).code !== "P2002") throw error;
    const winner = await prisma.attendance.findUnique({ where, select: { status: true } });
    return { recorded: false, status: winner?.status ?? null };
  }
  return { recorded: true, status };
};
