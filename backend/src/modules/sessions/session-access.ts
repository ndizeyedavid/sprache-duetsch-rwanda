import type { RequestHandler } from 'express';
import { assertTeacherOwnsClass, assertAccountActive, assertPaymentAccess, loadStudentAccessProfile } from '../../lib/access.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { forbidden, notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import type { StudentAccessProfile } from '../../lib/access.js';

export const requireSessionOwnership: RequestHandler = asyncHandler(async (req, _res, next) => {
  if (req.user?.role === 'TEACHER') {
    const id = String(req.params.id);
    const session = await prisma.classSession.findUnique({ where: { id }, select: { classGroupId: true } });
    if (!session) throw notFound('Session not found');
    await assertTeacherOwnsClass(req.user.id, session.classGroupId);
  }
  next();
});
export async function loadScheduleAccess(userId: string) {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  return profile;
}
export function protectStudentSession<T extends { meetingUrl: string | null; recordingUrl: string | null; status: string; endAt: Date }>(session: T, profile: StudentAccessProfile): T & { accessMessage: string | null } {
  let accessMessage: string | null = null;
  try { assertPaymentAccess(profile, 'LIVE_SESSION'); } catch { accessMessage = 'Payment required to access class links and materials.'; }
  const ended = session.endAt.getTime() < Date.now() || ['COMPLETED', 'CANCELLED'].includes(session.status);
  return { ...session, meetingUrl: ended || accessMessage ? null : session.meetingUrl, recordingUrl: accessMessage || session.status === 'CANCELLED' ? null : session.recordingUrl, accessMessage };
}
export async function enforceAttendanceScope(actor: {id: string; role: string}, classGroupId?: string) {
  if (actor.role === 'STUDENT') await loadScheduleAccess(actor.id);
  if (actor.role !== 'TEACHER') return {};
  if (classGroupId) await assertTeacherOwnsClass(actor.id, classGroupId);
  return { classGroup: { teacherId: actor.id } };
}
export async function assertValidTeacher(id: string | null) {
  if (!id) throw forbidden('Assign an active teacher to this class before scheduling.');
  const teacher = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true } });
  if (teacher?.role !== 'TEACHER' || teacher.status !== 'ACTIVE') throw forbidden('Session teacher must be an active teacher.');
}
