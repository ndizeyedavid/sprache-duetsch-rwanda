// Course v2 import: packs → Lesson.content/body + PRACTICE sessions + tasks, into lessons the v1
// HTML import already created (same stable ids). Dry-run unless `apply`; applying backs up first.
// The v1 single-question exercises are unpublished (history kept); flashcards and writing are
// updated in place.
import { writeFile } from "node:fs/promises";
import type { Prisma } from "../../../src/generated/prisma/client.js";
import { prisma } from "../../../src/lib/prisma.js";
import { writeBackup } from "../backup.js";
import { courseIds } from "../html-course/spec.js";
import { AudioCollector } from "./audio.js";
import { renderV2Body } from "./body-html.js";
import { buildLessonContent, lessonGlossary } from "./build-content.js";
import { sessionActivities } from "./build-sessions.js";
import { flashcardTask, speakingTask, writingTask } from "./build-tasks.js";
import { loadLevelGlossary, loadPacks, loadSource } from "./packs.js";

type Row = { id: string; title: string; type: Prisma.ActivityCreateInput["type"]; instructions: string; order: number; config: Prisma.InputJsonObject };

/** Every clip the level's packs need (lesson pages, sessions, flashcards, speaking model). */
function levelClips(course: Awaited<ReturnType<typeof loadSource>>["course"], glossary: Awaited<ReturnType<typeof loadLevelGlossary>>, packs: Awaited<ReturnType<typeof loadPacks>>) {
  const audio = new AudioCollector();
  for (const { pack } of packs) {
    buildLessonContent(pack, course.lektionen.find((lesson) => lesson.nr === pack.lesson)?.bild, glossary, audio);
    sessionActivities(pack, audio);
    flashcardTask(pack, audio);
    speakingTask(pack, audio);
  }
  return audio.list();
}

/** Minutes: reading the lesson, ~20 s per practice question, writing and speaking. */
const minutes = (questions: number, tasks: number) => Math.round((20 + questions / 3 + tasks * 12) / 5) * 5;

export async function importV2(level: string, lessons: number[] | null, { apply }: { apply: boolean }) {
  const { spec, course } = await loadSource(level);
  const ids = courseIds(spec);
  const glossary = await loadLevelGlossary(level);
  const packs = await loadPacks(level, lessons);
  if (!packs.length) throw new Error(`No packs found for ${level}${lessons ? ` lessons ${lessons.join(",")}` : ""}`);
  const audio = new AudioCollector();

  const plans = packs.map(({ pack }) => {
    const source = course.lektionen.find((lesson) => lesson.nr === pack.lesson);
    if (!source) throw new Error(`${level} lesson ${pack.lesson} is not in the source course`);
    const content = buildLessonContent(pack, source.bild, glossary, audio);
    const sessions = sessionActivities(pack, audio);
    const tasks = [flashcardTask(pack, audio), ...writingTask(pack), ...speakingTask(pack, audio)];
    const rows: Row[] = [
      ...sessions.map((s) => ({ id: ids.id(s.key), title: s.title, type: "PRACTICE" as const, instructions: s.instructions, order: s.order, config: s.config })),
      ...tasks.map((t) => ({ id: ids.id(t.key), title: t.title, type: t.type, instructions: t.instructions, order: t.order, config: t.config })),
    ];
    const questions = sessions.reduce((n, s) => n + s.config.items.length, 0);
    return {
      nr: pack.lesson,
      lessonId: ids.lesson(pack.lesson),
      data: { description: pack.summary, body: renderV2Body(content, source.bild?.id), content: content, estimatedMinutes: minutes(questions, tasks.length - 1) },
      rows,
      retire: source.uebungen.map((_, index) => ids.id(`exercise:${pack.lesson}.${index + 1}`)),
      summary: { lesson: pack.lesson, sessions: sessions.map((s) => `${s.config.session}:${s.config.items.length}`), questions, missingGlossary: lessonGlossary(pack, glossary).missing },
    };
  });

  // The manifest always lists the whole level (every pack), so generate_audio.py --prune is safe.
  const clips = lessons ? levelClips(course, glossary, await loadPacks(level, null)) : audio.list();
  const manifest = new URL(`./audio-${level.toUpperCase()}.json`, import.meta.url);
  await writeFile(manifest, `${JSON.stringify(clips, null, 1)}\n`);
  const report = { level, lessons: plans.map((plan) => plan.summary), audioClips: clips.length, audioManifest: manifest.pathname };
  if (!apply) return { ...report, mode: "dry-run" };

  const existing = await prisma.lesson.findMany({ where: { id: { in: plans.map((plan) => plan.lessonId) } }, include: { activities: true } });
  const missing = plans.filter((plan) => !existing.some((lesson) => lesson.id === plan.lessonId));
  if (missing.length) throw new Error(`Lessons ${missing.map((plan) => plan.nr).join(", ")} are missing: run the ${level} v1 import first`);
  const levelRow = await prisma.level.findUniqueOrThrow({ where: { code: spec.level }, select: { id: true } });
  const backup = await writeBackup(`${level.toLowerCase()}-v2`, { lessons: existing });

  await prisma.$transaction(async (tx) => {
    for (const plan of plans) {
      await tx.lesson.update({ where: { id: plan.lessonId }, data: plan.data });
      for (const { id, ...row } of plan.rows) {
        const data = { ...row, lessonId: plan.lessonId, isPublished: true };
        await tx.activity.upsert({ where: { id }, create: { id, ...data }, update: data });
      }
      await tx.activity.updateMany({ where: { id: { in: plan.retire } }, data: { isPublished: false } });
    }
    await tx.auditLog.create({ data: {
      action: "CURRICULUM_IMPORTED", entityType: "Level", entityId: levelRow.id, reason: `${level} course v2 import`,
      after: report,
    } });
  }, { timeout: 120_000 });
  return { ...report, mode: "applied", backup };
}
