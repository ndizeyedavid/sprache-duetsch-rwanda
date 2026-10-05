import { prisma } from '../../lib/prisma.js';
import { notifyUsers } from '../../lib/notify.js';
import type { ClassSession } from '../../generated/prisma/client.js';
export async function notifySessionChange(session: ClassSession, title: string, reason?: string | null) {
  const rows = await prisma.enrollment.findMany({ where: { classGroupId: session.classGroupId, status: 'ACTIVE' }, select: { student: { select: { userId: true } } } });
  return notifyUsers(rows.map(r => r.student.userId), { type: 'SCHEDULE', title, body: `${session.title ?? 'Your class'} · ${session.startAt.toISOString()}${reason ? ` · ${reason}` : ''}`, data: { sessionId: session.id, status: session.status } });
}
