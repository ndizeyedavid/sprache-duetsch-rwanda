import { assertAccountActive, loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { assignmentInclude, getStudentAssignment } from "./assignment-access.js";
import { publicQuestions } from "./assignment-questions.js";
import { effectiveDueAt } from "./late-penalty.js";

const fileFields = { id: true, originalName: true, mimeType: true, sizeBytes: true } as const;

/** Published homework the student receives, sorted by their own (extension-aware) deadline. */
export const listStudent = async (userId: string, lessonId?: string) => {
  const p = await loadStudentAccessProfile(userId);
  assertAccountActive(p);
  const rows = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED", ...(lessonId ? { lessonId } : {}), classGroupId: { in: p.classGroupIds }, classGroup: { levelId: { in: p.levelIds } },
      AND: [
        { OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] },
        { OR: [{ recipients: { none: {} } }, { recipients: { some: { studentId: p.studentId } } }] },
      ],
    },
    include: {
      ...assignmentInclude,
      submissions: { where: { studentId: p.studentId } },
      extensions: { where: { studentId: p.studentId }, select: { dueAt: true, reason: true } },
    },
  });
  return rows
    .map(({ extensions, ...a }) => {
      const extension = extensions[0] ?? null;
      return { ...a, dueAt: effectiveDueAt(a.dueAt, extension?.dueAt), originalDueAt: a.dueAt, extension, questions: publicQuestions(a.questions) };
    })
    .sort((a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity) || a.title.localeCompare(b.title));
};

export const getStudentDetail = async (userId: string, id: string) => {
  const { assignment, profile } = await getStudentAssignment(userId, id);
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId: id, studentId: profile.studentId } },
    include: { versions: { orderBy: { revision: "desc" } } },
  });
  const files = await prisma.assignmentFile.findMany({ where: { assignmentId: id, uploaderId: userId }, select: fileFields });
  const audioIds = [submission?.feedbackAudioFileId, ...(submission?.versions ?? []).map((v) => v.feedbackAudioFileId)].filter((v): v is string => !!v);
  const feedbackFiles = audioIds.length ? await prisma.assignmentFile.findMany({ where: { assignmentId: id, id: { in: audioIds } }, select: fileFields }) : [];
  return { assignment: { ...assignment, questions: publicQuestions(assignment.questions) }, submission, files, feedbackFiles };
};
