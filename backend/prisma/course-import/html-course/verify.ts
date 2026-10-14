// Check an imported HTML course in the configured database against its manifest.
import assert from "node:assert/strict";
import { prisma } from "../../../src/lib/prisma.js";
import { gradeActivity } from "../../../src/modules/content/activity-grading.js";
import { isPracticeConfig } from "../../../src/modules/content/practice.utils.js";
import { lessonActivities } from "./activities.js";
import type { CourseItem } from "./activities.js";
import { renderLessonBody } from "./body.js";
import { loadCourse } from "./course.js";
import { courseIds } from "./spec.js";
import type { CourseSpec } from "./spec.js";

export async function verifyCourse(spec: CourseSpec) {
  const course = await loadCourse(spec);
  const ids = courseIds(spec);
  const modules = await prisma.module.findMany({
    where: { level: { code: spec.level }, isPublished: true }, orderBy: { order: "asc" },
    include: { lessons: { where: { isPublished: true }, orderBy: { order: "asc" }, include: { activities: { where: { isPublished: true } } } } },
  });
  const importIds = course.module.map((m) => ids.module(m.nr));
  const imported = modules.filter((m) => importIds.includes(m.id));
  assert.deepEqual(imported.map((m) => m.id), importIds, `imported ${spec.level} modules are missing, unpublished or out of order`);
  const lessons = imported.flatMap((m) => m.lessons);
  assert.equal(lessons.length, spec.size.lessons);
  let items = 0;
  let cards = 0;
  let writing = 0;
  for (const source of course.lektionen) {
    const lesson = lessons.find((l) => l.id === ids.lesson(source.nr));
    assert.ok(lesson, `Lesson ${source.nr} missing or unpublished`);
    assert.equal(lesson.moduleId, ids.module(source.modul));
    assert.equal(lesson.body, renderLessonBody(source), `Lesson ${source.nr} body differs`);
    const expected = new Set(lessonActivities(source, course.source.file, ids.id).map((a) => a.id));
    const own = lesson.activities.filter((a) => expected.has(a.id));
    assert.equal(own.length, expected.size, `Lesson ${source.nr} is missing imported activities`);
    for (const activity of own) {
      const config = activity.config as { cards?: unknown[]; items?: CourseItem[] };
      if (activity.type === "FLASHCARD") { cards += config.cards?.length ?? 0; continue; }
      assert.ok(isPracticeConfig(activity.config));
      if (activity.type === "WRITING") { writing += 1; continue; }
      for (const item of config.items ?? []) {
        items += 1;
        // Grade through the same function the API uses for student submissions.
        for (const answer of [item.answer, ...(item.answers ?? [])]) {
          const result = gradeActivity(activity.type, { [item.id]: answer }, activity.config as Record<string, unknown>);
          assert.equal(result.isCorrect, true, `${activity.title}: "${answer}" should be accepted`);
        }
      }
    }
  }
  assert.equal(items, spec.size.exercises);
  assert.equal(cards, spec.size.words);
  assert.equal(writing, spec.size.writingTasks);
  const archived = await prisma.module.count({ where: { level: { code: spec.level }, isPublished: false } });
  return {
    level: spec.level, modules: imported.length, otherPublishedModules: modules.length - imported.length, lessons: lessons.length,
    exerciseItems: items, flashcards: cards, writingTasks: writing, archivedModules: archived, contentMatchesManifest: true,
  };
}
