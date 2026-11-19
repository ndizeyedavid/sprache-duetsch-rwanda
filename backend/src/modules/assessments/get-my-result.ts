// The latest submitted attempt of a test split by skill, like a Goethe result sheet (Hören, Lesen,
// Schreiben…). Auto-marked parts count at once; a part with teacher-marked questions stays pending
// until the teacher grades the attempt.
import { assertAccountActive,loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { readSnapshot } from "./attempt-snapshot.js";
import { isObjectiveQuestionType } from "./is-objective-question-type.js";

const SKILL_ORDER = ["LISTENING", "READING", "VOCABULARY", "GRAMMAR", "WRITING", "SPEAKING"];
export type ResultPart = { skill: string; score: number; maxScore: number; pending: boolean };

export const getMyAssessmentResult = async (userId: string, assessmentId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const attempt = await prisma.attempt.findFirst({
    where: { assessmentId, studentId: profile.studentId, status: { in: ["SUBMITTED", "GRADED"] } },
    orderBy: { attemptNumber: "desc" },
    select: {
      id: true, status: true, questionSnapshot: true,
      answers: { select: { questionId: true, pointsAwarded: true } },
      assessment: { select: { questions: { select: { points: true, question: { select: { id: true, type: true, skill: true, points: true } } } } } },
    },
  });
  if (!attempt) return null;
  const rows = readSnapshot(attempt.questionSnapshot) ?? attempt.assessment.questions;
  const awarded = new Map(attempt.answers.map((answer) => [answer.questionId, Number(answer.pointsAwarded)]));
  const parts = new Map<string, ResultPart>();
  for (const row of rows) {
    const part = parts.get(row.question.skill) ?? { skill: row.question.skill, score: 0, maxScore: 0, pending: false };
    part.maxScore += Number(row.points ?? row.question.points);
    part.score += awarded.get(row.question.id) ?? 0;
    if (!isObjectiveQuestionType(row.question.type) && attempt.status !== "GRADED") part.pending = true;
    parts.set(part.skill, part);
  }
  const sorted = [...parts.values()].sort((a, b) => SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill));
  return { attemptId: attempt.id, status: attempt.status, parts: sorted };
};
