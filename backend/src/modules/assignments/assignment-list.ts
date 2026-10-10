import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../types/auth.js';
import { assignmentInclude,staffScope } from './assignment-access.js';

export async function listStaffAssignments(actor: AuthUser) {
  const rows = await prisma.assignment.findMany({ where: staffScope(actor), include: { ...assignmentInclude,
    submissions: { select: { status: true, studentId: true, revision: true, score: true } } }, orderBy: { updatedAt: 'desc' } });
  const enrollments = await prisma.enrollment.findMany({ where: { classGroupId: { in: rows.map(a => a.classGroupId) }, status: 'ACTIVE' }, select: { classGroupId: true, studentId: true } });
  return rows.map(a => {
    const roster = new Set(enrollments.filter(e => e.classGroupId === a.classGroupId && (!a.recipients.length || a.recipients.some(r => r.studentId === e.studentId))).map(e => e.studentId));
    const work = a.submissions.filter(s => roster.has(s.studentId) && s.revision > 0);
    const graded = work.filter(s => s.status === 'GRADED');
    return { ...a, summary: { assigned: roster.size, received: work.length, missing: roster.size - work.length,
      toReview: work.filter(s => s.status === 'SUBMITTED').length, graded: graded.length,
      returned: work.filter(s => s.status === 'RETURNED').length,
      averageScore: graded.length ? graded.reduce((sum, s) => sum + Number(s.score), 0) / graded.length : null } };
  });
}
