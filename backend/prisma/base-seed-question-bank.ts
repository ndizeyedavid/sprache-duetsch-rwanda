import type {
Skill
} from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
export const seedQuestionBank = async (params: { levelIds: Map<string, string> }) => {
  const { levelIds } = params;
  const levelId = levelIds.get("A1")!;

  const questions: {
    prompt: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
    skill: Skill;
    options?: unknown;
    correctAnswer: unknown;
    explanation?: string;
  }[] = [
    {
      prompt: "Wie sagt man «Good morning» auf Deutsch?",
      type: "SINGLE_CHOICE",
      skill: "VOCABULARY",
      options: ["Guten Morgen", "Guten Abend", "Gute Nacht", "Guten Tag"],
      correctAnswer: "Guten Morgen",
      explanation: "«Guten Morgen» wird bis etwa 11 Uhr verwendet.",
    },
    {
      prompt: "Der Artikel von «Buch» ist «das».",
      type: "TRUE_FALSE",
      skill: "GRAMMAR",
      options: ["Richtig", "Falsch"],
      correctAnswer: "Richtig",
    },
    {
      prompt: "Ich ___ Student.",
      type: "FILL_BLANK",
      skill: "GRAMMAR",
      correctAnswer: "bin",
      explanation: "Erste Person Singular von «sein» ist «bin».",
    },
  ];

  const questionIds: string[] = [];
  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { levelId, prompt: q.prompt } });
    const record =
      existing ??
      (await prisma.question.create({
        data: {
          levelId,
          skill: q.skill,
          difficulty: "EASY",
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation ?? null,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          points: 1,
        },
      }));
    questionIds.push(record.id);
  }

  const title = "Einstufungstest — A1";
  let assessment = await prisma.assessment.findFirst({ where: { levelId, title } });
  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        levelId,
        title,
        description: "Kurzer Test zur Einstufung. Empfiehlt A1 oder höher.",
        type: "PLACEMENT",
        durationMinutes: 15,
        maxAttempts: 1,
        passMark: 50,
        isPublished: true,
      },
    });
  }

  for (let i = 0; i < questionIds.length; i += 1) {
    await prisma.assessmentQuestion.upsert({
      where: {
        assessmentId_questionId: { assessmentId: assessment.id, questionId: questionIds[i] },
      },
      update: { order: i + 1 },
      create: { assessmentId: assessment.id, questionId: questionIds[i], order: i + 1 },
    });
  }
};
