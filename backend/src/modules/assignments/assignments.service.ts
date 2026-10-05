import type { AuthUser } from "../../types/auth.js";
import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict } from "../../lib/http-error.js";
import { writeAudit } from "../../lib/audit.js";
import { notifyUsers } from "../../lib/notify.js";
import { assertAccountActive, loadStudentAccessProfile } from "../../lib/access.js";
import { assignmentInclude, checkClass, getStaffAssignment, getStudentAssignment, staffScope } from "./assignment-access.js";
import type { AssignmentInput } from "./assignments.schema.js";
export const listStaff = async (actor: AuthUser) => prisma.assignment.findMany({ where: staffScope(actor), include: { ...assignmentInclude, _count: { select: { submissions: true } }, submissions: { select: { status: true } } }, orderBy: { updatedAt: "desc" } });
export const listStudent = async (userId: string) => {
  const p = await loadStudentAccessProfile(userId); assertAccountActive(p);
  return prisma.assignment.findMany({ where: { status: "PUBLISHED", classGroupId: { in: p.classGroupIds }, classGroup: { levelId: { in: p.levelIds } }, AND: [ { OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] }, { OR: [{ recipients: { none: {} } }, { recipients: { some: { studentId: p.studentId } } }] } ] }, include: { ...assignmentInclude, submissions: { where: { studentId: p.studentId } } }, orderBy: { dueAt: "asc" } });
};
export const getStudentDetail = async (userId: string, id: string) => {
  const { assignment, profile } = await getStudentAssignment(userId, id);
  const submission = await prisma.assignmentSubmission.findUnique({ where: { assignmentId_studentId: { assignmentId: id, studentId: profile.studentId } }, include: { versions: { orderBy: { revision: "desc" } } } });
  const files = await prisma.assignmentFile.findMany({ where: { assignmentId: id, uploaderId: userId }, select: { id: true, originalName: true, mimeType: true, sizeBytes: true } });
  return { assignment, submission, files };
};
export const getStaffDetail = async (actor: AuthUser, id: string) => {
  const assignment = await getStaffAssignment(actor, id);
  const submissions = await prisma.assignmentSubmission.findMany({ where: { assignmentId: id }, include: { student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } }, versions: { orderBy: { revision: "desc" } } }, orderBy: { submittedAt: "desc" } });
  const roster = await prisma.enrollment.findMany({ where: { classGroupId: assignment.classGroupId, status: "ACTIVE", ...(assignment.recipients.length ? { studentId: { in: assignment.recipients.map(r => r.studentId) } } : {}) }, select: { student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } } }, distinct: ["studentId"] });
  const files = await prisma.assignmentFile.findMany({ where: { assignmentId: id }, select: { id: true, originalName: true, mimeType: true, sizeBytes: true } });
  const visible = submissions.map(s => ({ ...s, text: s.versions[0]?.text ?? "", fileIds: s.versions[0]?.fileIds ?? [] }));
  const submittedFiles = new Set(submissions.flatMap(s => s.versions.flatMap(v => v.fileIds)));
  return { assignment, submissions: visible, roster: roster.map(r => r.student), files: files.filter(f => submittedFiles.has(f.id)) };
};
export const saveAssignment = async (actor: AuthUser, input: AssignmentInput, id?: string) => {
  await checkClass(actor, input.classGroupId);
  const previous = id ? await getStaffAssignment(actor, id) : null;
  if (previous && previous.classGroupId !== input.classGroupId) throw conflict("An assignment cannot be moved to another class");
  const enrolled = await prisma.enrollment.findMany({ where: { classGroupId: input.classGroupId, status: "ACTIVE" }, select: { studentId: true, student: { select: { userId: true } } }, distinct: ["studentId"] });
  if (input.studentIds.some(s => !enrolled.some(e => e.studentId === s))) throw badRequest("Select students from this class");
  const { studentIds, ...data } = input;
  const result = await prisma.$transaction(async tx => {
    if (id) {
      if (await tx.assignmentSubmission.count({ where: { assignmentId: id, revision: { gt: 0 } } })) {
        if (previous?.instructions !== input.instructions || Number(previous?.maxPoints) !== input.maxPoints || previous?.responseType !== input.responseType || JSON.stringify((previous?.rubric as { title: string; description: string; points: number }[]).map(r => [r.title, r.description, r.points])) !== JSON.stringify(input.rubric.map(r => [r.title, r.description, r.points]))
          || JSON.stringify(previous?.recipients.map(r => r.studentId).sort()) !== JSON.stringify([...new Set(studentIds)].sort())) throw conflict("After submissions, keep instructions, points, response type, rubric and recipients unchanged");
      }
      await tx.assignmentRecipient.deleteMany({ where: { assignmentId: id } });
      return tx.assignment.update({ where: { id }, data: { ...data, recipients: { create: [...new Set(studentIds)].map(studentId => ({ studentId })) } }, include: assignmentInclude });
    }
    return tx.assignment.create({ data: { ...data, createdById: actor.id, recipients: { create: [...new Set(studentIds)].map(studentId => ({ studentId })) } }, include: assignmentInclude });
  });
  await writeAudit({ actorId: actor.id, action: id ? "ASSIGNMENT_UPDATED" : "ASSIGNMENT_CREATED", entityType: "Assignment", entityId: result.id });
  if (result.status === "PUBLISHED" && previous?.status !== "PUBLISHED") await notifyUsers(enrolled.filter(e => !studentIds.length || studentIds.includes(e.studentId)).map(e => e.student.userId), { type: "ASSIGNMENT", title: `New assignment: ${result.title}`, body: "Open Assignments to read the instructions and prepare your work.", data: { assignmentId: result.id } });
  return result;
};

export const getClassRecipients = async (actor: AuthUser, id: string) => {
  await checkClass(actor, id);
  const rows = await prisma.enrollment.findMany({ where: { classGroupId: id, status: "ACTIVE" }, distinct: ["studentId"], select: { student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } } } });
  return rows.map(r => r.student);
};
