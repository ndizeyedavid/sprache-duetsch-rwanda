import type { Prisma, QuestionType } from "../../src/generated/prisma/client.js";
import { prisma } from "../../src/lib/prisma.js";
import type { DemoContext } from "./context.js";
import { daysFromNow } from "./context.js";
import { DEMO_QUIZ_TITLE } from "./reset.js";

type Q = { type: QuestionType; prompt: string; options?: string[]; answer: unknown; skill: "VOCABULARY" | "GRAMMAR" | "WRITING" };
const QUESTIONS: Q[] = [
  { type: "SINGLE_CHOICE", skill: "VOCABULARY", prompt: "Wie begrüßt man jemanden am Morgen?", options: ["Guten Morgen", "Gute Nacht", "Tschüss", "Danke"], answer: "Guten Morgen" },
  { type: "SINGLE_CHOICE", skill: "GRAMMAR", prompt: "Ich ___ Nella.", options: ["heiße", "heißt", "heißen", "heiß"], answer: "heiße" },
  { type: "TRUE_FALSE", skill: "VOCABULARY", prompt: "„Tschüss“ sagt man, wenn man geht.", answer: true },
  { type: "FILL_BLANK", skill: "GRAMMAR", prompt: "Woher ___ du? (kommen)", answer: "kommst" },
  { type: "SHORT_TEXT", skill: "WRITING", prompt: "Stellen Sie sich in zwei Sätzen vor.", answer: null },
];

/** A published A1 quiz with graded, submitted (needs manual grading) and in-progress attempts. */
export async function seedQuiz(ctx: DemoContext) {
  const levelId = ctx.levels.get("A1")!;
  const teacherId = ctx.staff.get("teacherA1")!;
  const assessment = await prisma.assessment.create({
    data: {
      levelId, title: DEMO_QUIZ_TITLE, description: "Short demo quiz: greetings and introductions.", type: "QUIZ",
      durationMinutes: 15, maxAttempts: 2, passMark: 60, isPublished: true, availableFrom: daysFromNow(-20),
    },
  });
  const rows = [];
  for (const [order, q] of QUESTIONS.entries()) {
    const question = await prisma.question.create({
      data: {
        levelId, type: q.type, skill: q.skill, prompt: q.prompt, points: q.type === "SHORT_TEXT" ? 2 : 1, createdById: teacherId,
        options: q.options ?? (q.type === "TRUE_FALSE" ? ["Richtig", "Falsch"] : undefined),
        correctAnswer: q.answer === null ? undefined : (q.answer as Prisma.InputJsonValue),
      },
    });
    await prisma.assessmentQuestion.create({ data: { assessmentId: assessment.id, questionId: question.id, order } });
    rows.push({ order, q, question });
  }
  const maxScore = rows.reduce((sum, row) => sum + Number(row.question.points), 0);
  const snapshot = rows.map(({ order, question }) => ({
    id: `${assessment.id}-${order}`, order, points: null,
    question: { id: question.id, type: question.type, points: question.points.toString(), correctAnswer: question.correctAnswer,
      prompt: question.prompt, options: question.options, audioUrl: null, imageUrl: null, skill: question.skill, difficulty: question.difficulty },
  }));

  const plans = [
    { key: "student", status: "GRADED" as const, wrong: [3], essay: 2, day: -6 },
    { key: "paid", status: "GRADED" as const, wrong: [], essay: 2, day: -8 },
    { key: "overdue", status: "GRADED" as const, wrong: [0, 1, 3], essay: 0.5, day: -9 },
    { key: "partial", status: "SUBMITTED" as const, wrong: [2], essay: null, day: -1 },
    { key: "waived", status: "SUBMITTED" as const, wrong: [], essay: null, day: 0 },
  ];
  for (const plan of plans) {
    const ids = ctx.students.get(plan.key)!;
    let score = 0;
    const answers = rows.map(({ q, question }, index) => {
      const essay = q.type === "SHORT_TEXT";
      const correct = essay ? null : !plan.wrong.includes(index);
      const points = essay ? (plan.essay ?? 0) : correct ? Number(question.points) : 0;
      score += points;
      const response = essay ? "Ich heiße Demo. Ich komme aus Kigali und lerne Deutsch." : correct ? q.answer : q.type === "TRUE_FALSE" ? false : "falsch";
      return { questionId: question.id, response: response as Prisma.InputJsonValue, isCorrect: essay ? (plan.essay === null ? null : plan.essay >= 1) : correct, pointsAwarded: points };
    });
    const graded = plan.status === "GRADED";
    await prisma.attempt.create({
      data: {
        assessmentId: assessment.id, studentId: ids.studentId, enrollmentId: ids.enrollmentId, status: plan.status,
        startedAt: daysFromNow(plan.day, 17), submittedAt: daysFromNow(plan.day, 18), gradedAt: graded ? daysFromNow(plan.day + 1, 10) : null,
        score: graded ? score : null, maxScore, passed: graded ? score / maxScore >= 0.6 : null, gradedById: graded ? teacherId : null,
        feedback: graded ? "Gut gemacht! Achte auf die Verbendungen." : null, questionSnapshot: snapshot,
        answers: { create: answers },
      },
    });
  }
}
