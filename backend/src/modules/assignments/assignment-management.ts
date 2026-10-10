import type { Prisma } from '../../generated/prisma/client.js';
import { writeAudit,writeAuditTx } from '../../lib/audit.js';
import { conflict } from '../../lib/http-error.js';
import { notifyUsers } from '../../lib/notify.js';
import { prisma } from '../../lib/prisma.js';
import type { AuthUser } from '../../types/auth.js';
import { assignmentInclude,checkClass,getStaffAssignment } from './assignment-access.js';
import { assignmentQuestions } from './assignment-questions.js';
import { getClassRecipients,getStaffDetail } from './assignments.service.js';

export async function changeAssignmentStatus(actor: AuthUser, id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
  const previous = await getStaffAssignment(actor, id);
  const result = await prisma.assignment.update({ where: { id }, data: { status } });
  await writeAudit({ actorId: actor.id, action: 'ASSIGNMENT_STATUS_CHANGED', entityType: 'Assignment', entityId: id, before: { status: previous.status }, after: { status } });
  if (status === 'PUBLISHED' && previous.status !== 'PUBLISHED') {
    const rows = await prisma.enrollment.findMany({ where: { classGroupId: previous.classGroupId, status: 'ACTIVE', ...(previous.recipients.length ? { studentId: { in: previous.recipients.map(r => r.studentId) } } : {}) }, distinct: ['studentId'], select: { student: { select: { userId: true } } } });
    await notifyUsers(rows.map(r => r.student.userId), { type: 'ASSIGNMENT', title: `New assignment: ${previous.title}`, body: 'Open Assignments to read the instructions and prepare your work.', data: { assignmentId: id } });
  }
  return result;
}

export async function duplicateAssignment(actor: AuthUser, id: string) {
  const a = await getStaffAssignment(actor, id);
  const roster = await getClassRecipients(actor, a.classGroupId);
  await checkClass(actor, a.classGroupId);
  return prisma.$transaction(async tx => {
    const copy = await tx.assignment.create({ data: {
      classGroupId: a.classGroupId, createdById: actor.id, title: `${a.title.slice(0, 153)} (copy)`, instructions: a.instructions,
      responseType: a.responseType, status: 'DRAFT', estimatedMinutes: a.estimatedMinutes,
      maxPoints: a.maxPoints, allowLate: a.allowLate, maxSubmissions: a.maxSubmissions,
      resources: a.resources as Prisma.InputJsonValue, rubric: a.rubric as Prisma.InputJsonValue,
      questions: a.questions as Prisma.InputJsonValue,
      recipients: { create: a.recipients.filter(r => roster.some(s => s.id === r.studentId)).map(r => ({ studentId: r.studentId })) },
    }, include: assignmentInclude });
    await writeAuditTx(tx, { actorId: actor.id, action: 'ASSIGNMENT_DUPLICATED', entityType: 'Assignment', entityId: copy.id, before: { sourceId: id } });
    return copy;
  });
}

export async function deleteAssignment(actor: AuthUser, id: string): Promise<void> {
  await getStaffAssignment(actor, id);
  const result = await prisma.assignment.deleteMany({ where: { id, status: 'DRAFT', submissions: { none: { revision: { gt: 0 } } }, files: { none: {} } } });
  if (!result.count) throw conflict('Only drafts without submitted work or uploaded files can be deleted. Archive this assignment instead.');
  await writeAudit({ actorId: actor.id, action: 'ASSIGNMENT_DELETED', entityType: 'Assignment', entityId: id });
}

const csvText = (s: string) => /^[\s]*[=+\-@]/.test(s) ? `'${s}` : s;
export async function assignmentResults(actor: AuthUser, id: string): Promise<Record<string, unknown>[]> {
  const { assignment: a, submissions, roster } = await getStaffDetail(actor, id);
  const questions = assignmentQuestions(a.questions);
  return roster.map(r => {
    const s = submissions.find(s => s.studentId === r.id && s.revision > 0);
    return { 'Student ID': csvText(r.studentCode), Student: csvText(`${r.user.firstName} ${r.user.lastName}`),
      Assignment: csvText(a.title), Class: csvText(a.classGroup.name), Status: s?.status ?? 'NOT_SUBMITTED',
      'Submitted at': s?.submittedAt?.toISOString() ?? '', Late: s?.versions[0]?.isLate ? 'Yes' : 'No',
      Score: s?.status === 'GRADED' ? s.score?.toString() ?? '' : '', 'Total points': a.maxPoints.toString(),
      Questions: questions.length, Revision: s?.revision ?? 0, Feedback: csvText(s?.feedback ?? '') };
  });
}
