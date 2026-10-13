import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,conflict } from "../../lib/http-error.js";
import { notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../types/auth.js";
import { assignmentInclude,checkClass,getStaffAssignment } from "./assignment-access.js";
import { listExtensions } from "./assignment-extensions.js";
import { checkLesson } from "./assignment-lessons.js";
import { listStaffAssignments } from "./assignment-list.js";
import { assertQuestionsUnchanged,prepareQuestions } from "./assignment-questions.js";
import type { AssignmentInput } from "./assignments.schema.js";
import { computeLateness } from "./late-penalty.js";
export const listStaff = listStaffAssignments;
export const getStaffDetail = async (actor: AuthUser, id: string) => {
  const assignment = await getStaffAssignment(actor, id);
  const submissions = await prisma.assignmentSubmission.findMany({ where: { assignmentId: id }, include: { student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } }, versions: { orderBy: { revision: "desc" } } }, orderBy: { submittedAt: "desc" } });
  const roster = await prisma.enrollment.findMany({ where: { classGroupId: assignment.classGroupId, status: "ACTIVE", ...(assignment.recipients.length ? { studentId: { in: assignment.recipients.map(r => r.studentId) } } : {}) }, select: { student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } } }, distinct: ["studentId"] });
  const files = await prisma.assignmentFile.findMany({ where: { assignmentId: id }, select: { id: true, originalName: true, mimeType: true, sizeBytes: true } });
  const extensions = await listExtensions(id);
  // Lateness is previewed against today's extension and policy; grading applies the same rule.
  const lateness = (s: (typeof submissions)[number]) => s.versions[0] ? computeLateness({ submittedAt: s.versions[0].submittedAt, dueAt: assignment.dueAt, extensionDueAt: extensions.find(e => e.studentId === s.studentId)?.dueAt, policy: assignment }) : null;
  const visible = submissions.map(s => ({ ...s, text: s.versions[0]?.text ?? "", fileIds: s.versions[0]?.fileIds ?? [], responses: s.versions[0]?.responses ?? {}, lateness: lateness(s) }));
  const submittedFiles = new Set(submissions.flatMap(s => [s.feedbackAudioFileId, ...s.versions.flatMap(v => [...v.fileIds, v.feedbackAudioFileId])]));
  return { assignment, submissions: visible, roster: roster.map(r => r.student), files: files.filter(f => submittedFiles.has(f.id)), extensions };
};
export const saveAssignment = async (actor: AuthUser, input: AssignmentInput, id?: string) => {
  const group = await checkClass(actor, input.classGroupId);
  await checkLesson(input.lessonId, group.levelId);
  const previous = id ? await getStaffAssignment(actor, id) : null;
  if (previous && previous.classGroupId !== input.classGroupId) throw conflict("An assignment cannot be moved to another class");
  const enrolled = await prisma.enrollment.findMany({ where: { classGroupId: input.classGroupId, status: "ACTIVE" }, select: { studentId: true, student: { select: { userId: true } } }, distinct: ["studentId"] });
  if (input.studentIds.some(s => !enrolled.some(e => e.studentId === s))) throw badRequest("Select students from this class");
  const { studentIds, questions: authoredQuestions, ...fields } = input;
  const questions = prepareQuestions(authoredQuestions);
  const questionPoints = questions.reduce((sum, q) => sum + Number(q.points ?? q.question.points), 0);
  if (questions.length && (questionPoints <= 0 || questionPoints > 1000)) throw badRequest("Question points must total between 0 and 1000");
  const data = { ...fields, maxPoints: questions.length ? questionPoints : fields.maxPoints, questions: JSON.parse(JSON.stringify(questions)) as Prisma.InputJsonValue };
  const result = await prisma.$transaction(async tx => {
    if (id) {
      if (await tx.assignmentSubmission.count({ where: { assignmentId: id, revision: { gt: 0 } } })) {
        assertQuestionsUnchanged(previous!.questions, questions);
        if (previous?.instructions !== input.instructions || Number(previous?.maxPoints) !== data.maxPoints || previous?.responseType !== input.responseType || JSON.stringify((previous?.rubric as { title: string; description: string; points: number }[]).map(r => [r.title, r.description, r.points])) !== JSON.stringify(input.rubric.map(r => [r.title, r.description, r.points]))
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
