// The HTML ("body") lessons of a level in course order, with their published activities and the
// source lesson (vocabulary with English) from the course JSON. Course v2 lessons (Lesson.content)
// carry their own English and are skipped.
import { Prisma } from "../../../src/generated/prisma/client.js";
import { prisma } from "../../../src/lib/prisma.js";
import { courseIds } from "../html-course/spec.js";
import { loadSource } from "../v2/packs.js";
import { activityTexts,lessonBlocks } from "./segments.js";

export type BodyLesson = Awaited<ReturnType<typeof loadBodyLessons>>[number];

export async function loadBodyLessons(level: string) {
  const { spec, course } = await loadSource(level);
  const ids = courseIds(spec);
  const numbers = course.lektionen.map((lesson) => lesson.nr);
  const rows = await prisma.lesson.findMany({
    where: { id: { in: numbers.map((nr) => ids.lesson(nr)) }, isPublished: true, content: { equals: Prisma.DbNull }, module: { isPublished: true } },
    select: { id: true, title: true, body: true, activities: { where: { isPublished: true }, orderBy: { order: "asc" }, select: { id: true, type: true, instructions: true, config: true } } },
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return course.lektionen.flatMap((source) => {
    const lesson = byId.get(ids.lesson(source.nr));
    if (!lesson) return [];
    const activities = lesson.activities.map((activity) => ({ ...activity, texts: activityTexts(activity) }));
    return [{ nr: source.nr, level: level.toUpperCase(), lesson, source, blocks: lessonBlocks(lesson.body), activities }];
  });
}

/** Text students can read before answering (lesson page and activity prompts): it gets tap-to-translate. */
export const visibleTexts = (entry: BodyLesson): string[] =>
  [...new Set([...entry.blocks, ...entry.activities.flatMap((activity) => activity.texts.visible)])];

/** Everything that needs English, including explanations and model answers revealed after answering. */
export const allTexts = (entry: BodyLesson): string[] =>
  [...new Set([...visibleTexts(entry), ...entry.activities.flatMap((activity) => activity.texts.hidden)])];
