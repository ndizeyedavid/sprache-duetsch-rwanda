import { env } from '../../config/env.js';
import { notifyUsers } from '../../lib/notify.js';
import { prisma } from '../../lib/prisma.js';
export async function alertLowAttendance(classGroupId: string, name: string, studentIds: string[]): Promise<void> {
  const students = await prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, userId: true, attendance: { where: { session: { classGroupId, status: { not: 'CANCELLED' } } }, select: { status: true } } } });
  const day = new Date(); day.setUTCHours(0,0,0,0);
  for (const s of students) {
    const count = s.attendance.length;
    if (!count) continue;
    const percentage = Math.round(s.attendance.filter(r => ['PRESENT','LATE'].includes(r.status)).length / count * 10000) / 100;
    if (percentage >= env.ATTENDANCE_ALERT_THRESHOLD) continue;
    const existing = await prisma.notification.findFirst({ where: { userId: s.userId, title: 'Low attendance', createdAt: { gte: day }, data: { path: ['classGroupId'], equals: classGroupId } }, select: { id: true } });
    if (!existing) await notifyUsers([s.userId], { eventKey: `attendance:${classGroupId}:${day.toISOString()}`, type: 'CLASS', channel: 'IN_APP', title: 'Low attendance', body: `Your attendance in ${name} is ${percentage}%, below the required ${env.ATTENDANCE_ALERT_THRESHOLD}%.`, data: { classGroupId, percentage } });
  }
}
