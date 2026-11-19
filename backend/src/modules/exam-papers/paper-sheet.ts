// A student's online answer sheet for a past paper: the empty sheet (choices and item numbers, no
// answers) with the listening recordings and earlier results, and marking a filled sheet, which is
// saved so the student sees their best score and progress.
import { assertAccountActive,loadStudentAccessProfile } from "../../lib/access.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { answerSheet,markSheet,readAnswerKey } from "./answer-key.js";

async function paperWithKey(userId: string, id: string) {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const paper = await prisma.examPaper.findUnique({
    where: { id },
    select: {
      id: true, title: true, provider: true, levelId: true, isPublished: true, fileUrl: true, fileName: true, sourceUrl: true, answerKey: true,
      level: { select: { code: true, title: true } }, audio: { orderBy: { order: "asc" }, select: { id: true, title: true, url: true } },
    },
  });
  const key = paper?.isPublished ? readAnswerKey(paper.answerKey) : null;
  if (!paper || !key) throw notFound("This paper has no online answer sheet");
  if (!profile.levelIds.includes(paper.levelId)) throw forbidden("Complete payment for this course to unlock its exam papers");
  return { paper, key, studentId: profile.studentId };
}

export const getMyPaperSheet = async (userId: string, id: string) => {
  const { paper, key, studentId } = await paperWithKey(userId, id);
  const { answerKey: _key, isPublished: _published, levelId: _level, ...meta } = paper;
  const history = await prisma.examPaperAttempt.findMany({
    where: { paperId: id, studentId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, score: true, total: true, sections: true, createdAt: true },
  });
  return { ...meta, parts: answerSheet(key), history };
};

export const checkMyPaperSheet = async (userId: string, id: string, responses: (string | null)[][]) => {
  const { key, studentId } = await paperWithKey(userId, id);
  const mark = markSheet(key, responses);
  const attempt = await prisma.examPaperAttempt.create({
    data: { paperId: id, studentId, score: mark.score, total: mark.total, responses, sections: mark.sections },
    select: { id: true, createdAt: true },
  });
  return { ...mark, attemptId: attempt.id, createdAt: attempt.createdAt };
};
