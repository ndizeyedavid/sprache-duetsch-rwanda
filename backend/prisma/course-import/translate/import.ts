// Usage (from backend/): npx tsx prisma/course-import/translate/import.ts --level A2 [--apply]
// Gives the level's HTML lessons their English (Lesson.translation) and their activities hidden English
// (explanationEn / modelAnswerEn) from the translation memory. Dry-run by default: prints coverage —
// text without English and tappable words without a meaning. Always writes v2/audio-<LEVEL>-words.json
// (word-list clips) for generate_audio.py.
import { writeFile } from "node:fs/promises";
import type { Prisma } from "../../../src/generated/prisma/client.js";
import { prisma } from "../../../src/lib/prisma.js";
import { writeBackup } from "../backup.js";
import { AudioCollector } from "../v2/audio.js";
import { buildTranslation,withHiddenEnglish } from "./build-translation.js";
import { loadBodyLessons } from "./lessons.js";
import { loadMemory } from "./memory.js";

const level = (process.argv[process.argv.indexOf("--level") + 1] ?? "").toUpperCase();
const apply = process.argv.includes("--apply");

try {
  const memory = await loadMemory();
  const audio = new AudioCollector();
  const lessons = await loadBodyLessons(level);
  const planned = lessons.map((entry) => {
    const { translation, missingLines, missingForms } = buildTranslation(entry, memory, audio);
    const activities = entry.activities.map((activity) => ({ id: activity.id, before: activity.config, ...withHiddenEnglish(activity.config, memory) }));
    return { entry, translation, missingLines, missingForms, activities, missingHidden: activities.flatMap((row) => row.missing) };
  });
  await writeFile(new URL(`../v2/audio-${level}-words.json`, import.meta.url), `${JSON.stringify(audio.list(), null, 1)}\n`);
  const summary = planned.map((row) => ({
    lesson: row.entry.nr, lines: Object.keys(row.translation.lines).length, words: row.translation.words.length,
    tappable: Object.keys(row.translation.glossary).length, missingLines: row.missingLines.length, missingForms: row.missingForms.length, missingHidden: row.missingHidden.length,
  }));
  const totals = summary.reduce((sum, row) => ({ lessons: sum.lessons + 1, missingLines: sum.missingLines + row.missingLines, missingForms: sum.missingForms + row.missingForms, missingHidden: sum.missingHidden + row.missingHidden }),
    { lessons: 0, missingLines: 0, missingForms: 0, missingHidden: 0 });
  if (!apply) {
    const examples = planned.flatMap((row) => [...row.missingLines.slice(0, 2), ...row.missingForms.slice(0, 3)]).slice(0, 12);
    console.log(JSON.stringify({ level, mode: "dry-run", totals, wordClips: audio.list().length, examples, lessons: summary }, null, 2));
    process.exit(0);
  }

  const levelRow = await prisma.level.findUniqueOrThrow({ where: { code: level }, select: { id: true } });
  const backup = await writeBackup(`${level.toLowerCase()}-translations`, await prisma.lesson.findMany({
    where: { id: { in: lessons.map((entry) => entry.lesson.id) } }, select: { id: true, translation: true, activities: { select: { id: true, config: true } } },
  }));
  await prisma.$transaction(async (tx) => {
    for (const row of planned) {
      await tx.lesson.update({ where: { id: row.entry.lesson.id }, data: { translation: row.translation } });
      for (const activity of row.activities) {
        if (JSON.stringify(activity.config) === JSON.stringify(activity.before)) continue;
        await tx.activity.update({ where: { id: activity.id }, data: { config: activity.config as Prisma.InputJsonValue } });
      }
    }
    await tx.auditLog.create({ data: { action: "CURRICULUM_IMPORTED", entityType: "Level", entityId: levelRow.id, reason: `${level} English translations`, after: { totals } } });
  }, { timeout: 120_000 });
  console.log(JSON.stringify({ level, mode: "applied", totals, backup }, null, 2));
} finally {
  await prisma.$disconnect();
}
