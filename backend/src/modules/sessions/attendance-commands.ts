import { academicTransaction } from "../../lib/academic-transaction.js";
import type { Role } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { assertTeacherOwnsClass } from '../../lib/access.js';
import { writeAuditTx } from '../../lib/audit.js';
import { badRequest, conflict, forbidden, notFound } from '../../lib/http-error.js';
import { emitActivity } from '../activity/activity.service.js';
import { assertAttendanceOpen, assertUniqueStudents } from './attendance-policy.js';
import { alertLowAttendance } from './attendance-alerts.js';
import type { MarkAttendanceInput, UpdateAttendanceInput } from './sessions.schema.js';
export async function markAttendance(sessionId: string, input: MarkAttendanceInput, actorId?: string, actorRole?: Role) {
  assertUniqueStudents(input.records);
  const session = await prisma.classSession.findUnique({ where: { id: sessionId }, include: { classGroup: { select: { name: true } } } });
  if (!session) throw notFound('Session not found');
  if (actorRole === 'TEACHER') { if (!actorId) throw forbidden(); await assertTeacherOwnsClass(actorId, session.classGroupId); }
  assertAttendanceOpen(session);
  const changed = await academicTransaction(async tx => {
    const current = await tx.classSession.findUniqueOrThrow({ where: { id: sessionId } });
    assertAttendanceOpen(current);
    const enrollments = await tx.enrollment.findMany({ where: { classGroupId: session.classGroupId, status: { in: ['ACTIVE', 'COMPLETED'] } }, select: { studentId: true, enrolledAt: true } });
    const eligible = new Set(enrollments.filter(e => e.enrolledAt <= session.endAt).map(e => e.studentId));
    if (input.records.some(r => !eligible.has(r.studentId))) throw badRequest('Every student must be enrolled in this class at the time of the session');
    const before = await tx.attendance.findMany({ where: { sessionId, studentId: { in: input.records.map(r => r.studentId) } } });
    for (const r of input.records) { const old = before.find(b => b.studentId === r.studentId); if (r.expectedUpdatedAt !== undefined && (r.expectedUpdatedAt?.getTime() ?? null) !== (old?.updatedAt.getTime() ?? null)) throw conflict("Attendance changed since you opened the register. Refresh and review before saving."); }
    const changes = input.records.filter(r => { const old = before.find(b => b.studentId === r.studentId); return !old || old.status !== r.status || (r.note !== undefined && (r.note ?? null) !== old.note); });
    for (const r of changes) await tx.attendance.upsert({ where: { sessionId_studentId: { sessionId, studentId: r.studentId } }, create: { sessionId, studentId: r.studentId, status: r.status, note: r.note ?? null, markedById: actorId ?? null }, update: { status: r.status, note: r.note, markedById: actorId ?? null, markedAt: new Date() } });
    if (changes.length) await writeAuditTx(tx, { actorId, action: 'ATTENDANCE_MARKED', entityType: 'ClassSession', entityId: sessionId, before, after: { records: changes } });
    return changes;
  });
  if (changed.length) {
    await alertLowAttendance(session.classGroupId, session.classGroup.name, changed.map(r => r.studentId));
    await emitActivity({ actorId, type: 'ATTENDANCE', title: `Attendance marked for ${session.title ?? session.classGroup.name}`, body: `${changed.length} student records updated.`, classGroupId: session.classGroupId });
  }
  return { sessionId, marked: changed.length };
}
export async function updateAttendance(recordId: string, input: UpdateAttendanceInput, actorId?: string, actorRole?: Role) {
  const before = await prisma.attendance.findUnique({ where: { id: recordId } });
  if (!before) throw notFound('Attendance record not found');
  await markAttendance(before.sessionId, { records: [{ studentId: before.studentId, status: input.status ?? before.status, ...(input.note === undefined ? {} : { note: input.note }) }] }, actorId, actorRole);
  return prisma.attendance.findUniqueOrThrow({ where: { id: recordId } });
}
