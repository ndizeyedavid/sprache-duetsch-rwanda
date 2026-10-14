import { createHash } from "node:crypto";
import type { Difficulty } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { applyPlacementBands } from "./placement-level-bands.js";
import { placementQuestionsA } from "./placement-questions-a.js";
import { placementQuestionsB } from "./placement-questions-b.js";

/** Deterministic RFC 4122-shaped id so re-seeding updates rather than duplicates. */
const stableId = (key: string): string => {
  const h = createHash("sha1").update(`sparch:${key}`).digest("hex");
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const DIFFICULTY: Record<string, Difficulty> = { A1: "EASY", A2: "EASY", B1: "MEDIUM", B2: "HARD" };
const LEGACY_TITLE = "Einstufungstest — A1";
export const PLACEMENT_TEST_ID = stableId("placement-test:v1");

/**
 * Seeds the online placement test (40 objective questions, A1 → B2) and retires the
 * old 3-question test. Idempotent: questions are upserted by stable id; staff edits to
 * the test's settings (duration, attempts, publication) are kept on re-seed.
 */
export const seedPlacementTest = async () => {
  await applyPlacementBands();
  const home = (await prisma.level.findUnique({ where: { code: "A1" } }))
    ?? (await prisma.level.findFirst({ orderBy: { order: "asc" } }));
  if (!home) throw new Error("Seed levels before the placement test");

  const questions = [...placementQuestionsA, ...placementQuestionsB];
  const questionIds: string[] = [];
  for (const q of questions) {
    const id = stableId(`placement-question:${q.key}`);
    const content = {
      skill: q.skill,
      difficulty: DIFFICULTY[q.band],
      type: q.type,
      prompt: q.prompt,
      explanation: `Niveau ${q.band}: ${q.explanation}`,
      options: q.options,
      correctAnswer: q.answer,
      points: 1,
    };
    await prisma.question.upsert({ where: { id }, update: content, create: { id, levelId: home.id, ...content } });
    questionIds.push(id);
  }

  const existing = await prisma.assessment.findUnique({ where: { id: PLACEMENT_TEST_ID }, select: { id: true } });
  if (!existing) {
    await prisma.assessment.create({
      data: {
        id: PLACEMENT_TEST_ID,
        levelId: home.id,
        title: "Einstufungstest Deutsch (A1–B2)",
        description:
          "40 Fragen zu Wortschatz, Grammatik und Lesen, von leicht (A1) bis schwer (B2). Beantworten Sie alles, was Sie können — raten ist erlaubt. Das Ergebnis empfiehlt Ihr Niveau; das Sekretariat bestätigt es.",
        type: "PLACEMENT",
        durationMinutes: 35,
        maxAttempts: 1,
        passMark: 50,
        isPublished: true,
      },
    });
  }
  for (let i = 0; i < questionIds.length; i += 1) {
    await prisma.assessmentQuestion.upsert({
      where: { assessmentId_questionId: { assessmentId: PLACEMENT_TEST_ID, questionId: questionIds[i] } },
      update: { order: i + 1 },
      create: { assessmentId: PLACEMENT_TEST_ID, questionId: questionIds[i], order: i + 1 },
    });
  }

  // The legacy 3-question test is removed, or unpublished when someone already sat it.
  const legacy = await prisma.assessment.findMany({
    where: { type: "PLACEMENT", title: LEGACY_TITLE, id: { not: PLACEMENT_TEST_ID } },
    select: { id: true, _count: { select: { attempts: true } } },
  });
  for (const old of legacy) {
    if (old._count.attempts === 0) await prisma.assessment.delete({ where: { id: old.id } });
    else await prisma.assessment.update({ where: { id: old.id }, data: { isPublished: false } });
  }

  return { assessmentId: PLACEMENT_TEST_ID, questions: questionIds.length, retired: legacy.length };
};
