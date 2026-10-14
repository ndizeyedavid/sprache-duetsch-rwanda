import { env } from '../../config/env.js';
import { notifyUsers } from '../../lib/notify.js';
import { prisma } from '../../lib/prisma.js';
import { alertDayKey,digestAlertKey,digestBody,staffAlertRecipients,studentAlertKey,studentsBelowThreshold } from './attendance-alert-policy.js';
import { resolveAttendanceThreshold } from './attendance-threshold.js';

/**
 * After attendance changes: alert each changed student who is now below the class threshold,
 * and send the class teacher + academic/super admins one digest per class per day.
 * Dedupe rides on NotificationDelivery.eventKey (unique per recipient + class + UTC day).
 */
export async function alertLowAttendance(classGroupId: string, name: string, studentIds: string[]): Promise<void> {
  const group = await prisma.classGroup.findUnique({ where: { id: classGroupId }, select: {
    teacherId: true, attendanceAlertThreshold: true, level: { select: { attendanceAlertThreshold: true } },
  } });
  if (!group) return;
  const threshold = resolveAttendanceThreshold(group.attendanceAlertThreshold, group.level.attendanceAlertThreshold, env.ATTENDANCE_ALERT_THRESHOLD).value;
  const roster = await prisma.enrollment.findMany({ where: { classGroupId, status: 'ACTIVE' }, distinct: ['studentId'], select: { student: { select: {
    id: true, userId: true, user: { select: { firstName: true, lastName: true } },
    attendance: { where: { session: { classGroupId, status: { not: 'CANCELLED' } } }, select: { status: true } },
  } } } });
  const below = studentsBelowThreshold(roster.map(({ student }) => ({
    studentId: student.id, userId: student.userId, name: `${student.user.firstName} ${student.user.lastName}`.trim(),
    statuses: student.attendance.map(record => record.status),
  })), threshold);
  const changed = new Set(studentIds);
  const flagged = below.filter(row => changed.has(row.studentId));
  if (!flagged.length) return;
  const day = alertDayKey();
  for (const row of flagged) {
    await notifyUsers([row.userId], { eventKey: studentAlertKey(classGroupId, day), type: 'CLASS', channel: 'IN_APP', title: 'Low attendance',
      body: `Your attendance in ${name} is ${row.percentage}%, below the required ${threshold}%.`, data: { classGroupId, percentage: row.percentage, threshold } });
  }
  const admins = await prisma.user.findMany({ where: { role: { in: ['ACADEMIC_ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' }, select: { id: true } });
  await notifyUsers(staffAlertRecipients(group.teacherId, admins.map(admin => admin.id)), {
    eventKey: digestAlertKey(classGroupId, day), type: 'CLASS', channel: 'IN_APP', title: `Low attendance in ${name}`,
    body: digestBody(name, threshold, below),
    data: { kind: 'ATTENDANCE_DIGEST', classGroupId, threshold, students: below.map(row => ({ studentId: row.studentId, name: row.name, percentage: row.percentage })) },
  });
}
