import type {
Skill
} from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { seedPlacementTest } from "./seed-placement-test.js";
export const seedQuestionBank = async (params: { levelIds: Map<string, string> }) => {
  const { levelIds } = params;
  const levelId = levelIds.get("A1")!;

  const questions: {
    prompt: string;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
    skill: Skill;
    options?: string[];
    correctAnswer: string;
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

  // A1 starter question bank (kept for teachers; no longer used as the placement test).
  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { levelId, prompt: q.prompt } });
    if (existing) continue;
    await prisma.question.create({
      data: {
        levelId,
        skill: q.skill,
        difficulty: "EASY",
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation ?? null,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
      },
    });
  }

  // The online placement test (A1 → B2) replaces the old 3-question "Einstufungstest — A1".
  await seedPlacementTest();
};
