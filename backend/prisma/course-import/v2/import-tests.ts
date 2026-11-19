// Usage (from backend/): npx tsx prisma/course-import/v2/import-tests.ts --level A1 [--apply]
// Module tests + final exam of a level → Assessments (MODULE_TEST/FINAL_EXAM) with Questions.
// Dry-run by default; writes v2/audio-<LEVEL>-tests.json for generate_audio.py. The test opens once
// lesson `after` is completed and shows on that lesson's page.
import { writeFile } from "node:fs/promises";
import { prisma } from "../../../src/lib/prisma.js";
import { writeBackup } from "../backup.js";
import { courseIds } from "../html-course/spec.js";
import { AudioCollector } from "./audio.js";
import { buildTest,testKey } from "./build-test.js";
import { loadSource,loadTestPacks } from "./packs.js";

const level = (process.argv[process.argv.indexOf("--level") + 1] ?? "").toUpperCase();
const apply = process.argv.includes("--apply");
try {
  const { spec } = await loadSource(level);
  const ids = courseIds(spec);
  const audio = new AudioCollector();
  const tests = (await loadTestPacks(level)).map(({ file, pack }) => ({ file, pack, ...buildTest(pack, audio) }));
  await writeFile(new URL(`./audio-${level}-tests.json`, import.meta.url), `${JSON.stringify(audio.list(), null, 1)}\n`);
  const summary = tests.map(({ file, pack, questions }) => ({ file, title: pack.title, questions: questions.length, points: questions.reduce((sum, q) => sum + q.points, 0) }));
  if (!apply) { console.log(JSON.stringify({ level, mode: "dry-run", tests: summary, audioClips: audio.list().length }, null, 2)); process.exit(0); }

  const levelRow = await prisma.level.findUniqueOrThrow({ where: { code: spec.level }, select: { id: true } });
  const existing = await prisma.assessment.findMany({ where: { id: { in: tests.map(({ pack }) => ids.id(testKey(pack))) } }, include: { questions: true } });
  const backup = await writeBackup(`${level.toLowerCase()}-v2-tests`, { assessments: existing });
  await prisma.$transaction(async (tx) => {
    for (const { pack, questions, sections } of tests) {
      const assessmentId = ids.id(testKey(pack));
      const lessonId = ids.lesson(pack.after);
      for (const question of questions) {
        const data = {
          levelId: levelRow.id, moduleId: pack.module ? ids.module(pack.module) : null, skill: question.skill, difficulty: pack.kind === "final" ? "MEDIUM" as const : "EASY" as const,
          type: question.type, prompt: question.prompt, explanation: question.explanation, audioUrl: question.audioUrl,
          options: (question.options ?? undefined), correctAnswer: (question.correctAnswer ?? undefined), points: question.points,
        };
        await tx.question.upsert({ where: { id: ids.id(question.key) }, create: { id: ids.id(question.key), ...data }, update: data });
      }
      const data = {
        levelId: levelRow.id, lessonId, prerequisiteLessonId: lessonId, title: pack.title, description: `${pack.description}\n\n${pack.descriptionEn}`,
        type: pack.kind === "final" ? "FINAL_EXAM" as const : "MODULE_TEST" as const, durationMinutes: pack.durationMinutes, maxAttempts: pack.maxAttempts,
        passMark: pack.passMark, isPublished: true, protectedMode: pack.kind === "final",
        sections: sections.map(({ questionKeys, ...section }) => ({ ...section, questionIds: questionKeys.map((key) => ids.id(key)) })),
      };
      await tx.assessment.upsert({ where: { id: assessmentId }, create: { id: assessmentId, ...data }, update: data });
      await tx.assessmentQuestion.deleteMany({ where: { assessmentId } });
      await tx.assessmentQuestion.createMany({ data: questions.map((question, order) => ({ assessmentId, questionId: ids.id(question.key), order, points: question.points })) });
    }
    await tx.auditLog.create({ data: { action: "CURRICULUM_IMPORTED", entityType: "Level", entityId: levelRow.id, reason: `${level} course v2 tests import`, after: summary } });
  }, { timeout: 120_000 });
  console.log(JSON.stringify({ level, mode: "applied", tests: summary, backup }, null, 2));
} finally {
  await prisma.$disconnect();
}
