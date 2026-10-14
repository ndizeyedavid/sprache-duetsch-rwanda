// Plan the cleanup of A1 modules, lessons, activities and materials.
import { prisma } from "../../../src/lib/prisma.js";
import { isDummyUrl, placeholderReason, testReason } from "./signals.js";
import type { Kind, Steps } from "./types.js";
import { workLabel } from "./types.js";

const loadModules = (levelId: string) => prisma.module.findMany({
  where: { levelId },
  orderBy: { order: "asc" },
  include: { lessons: { orderBy: { order: "asc" }, include: {
    materials: true,
    progress: { select: { id: true } },
    assignments: { select: { id: true } },
    activities: { include: { _count: { select: { submissions: true } } } },
  } } },
});
type ModuleRow = Awaited<ReturnType<typeof loadModules>>[number];
type LessonRow = ModuleRow["lessons"][number];
type ActivityRow = LessonRow["activities"][number];

const lessonWork = (lesson: LessonRow) => workLabel({
  "progress records": lesson.progress.length,
  "activity submissions": lesson.activities.reduce((n, a) => n + a._count.submissions, 0),
  "linked assignments": lesson.assignments.length,
});

function flagActivity(steps: Steps, activity: ActivityRow, reason: string) {
  const work = workLabel({ "activity submissions": activity._count.submissions });
  steps.push(work
    ? { kind: "activity", id: activity.id, title: activity.title, action: activity.isPublished ? "unpublish" : "keep", reason: `${reason}; kept: ${work}` }
    : { kind: "activity", id: activity.id, title: activity.title, action: "delete", reason });
}

function flagLesson(steps: Steps, lesson: LessonRow, reason: string) {
  const work = lessonWork(lesson);
  if (!work) {
    steps.push({ kind: "lesson", id: lesson.id, title: lesson.title, action: "delete", reason });
    return;
  }
  steps.push({ kind: "lesson", id: lesson.id, title: lesson.title, action: lesson.isPublished ? "unpublish" : "keep", reason: `${reason}; kept: ${work}` });
  for (const activity of lesson.activities) flagActivity(steps, activity, reason);
  for (const material of lesson.materials) steps.push({ kind: "material", id: material.id, title: material.title, action: "delete", reason });
}

function flagModule(steps: Steps, module: ModuleRow, reason: string) {
  if (!module.lessons.some(lessonWork)) {
    steps.push({ kind: "module", id: module.id, title: module.title, action: "delete", reason });
    return;
  }
  steps.push({ kind: "module", id: module.id, title: module.title, action: module.isPublished ? "unpublish" : "keep", reason: `${reason}; kept: lessons have student work` });
  for (const lesson of module.lessons) flagLesson(steps, lesson, reason);
}

function restore(steps: Steps, kind: Kind, row: { id: string; title: string; isPublished: boolean }, republish: boolean) {
  if (row.isPublished) return;
  steps.push({ kind, id: row.id, title: row.title, action: republish ? "republish" : "keep",
    reason: republish ? "imported A1 content was unpublished" : "imported A1 content is unpublished; pass --republish-imported to restore it" });
}

/** Imported records are never deleted; everything else is checked against the test/demo signals. */
export async function planCurriculum(level: { id: string; code: string }, importIds: Set<string>, republish: boolean): Promise<Steps> {
  const steps: Steps = [];
  for (const module of await loadModules(level.id)) {
    const imported = importIds.has(module.id);
    const reason = imported ? null : placeholderReason(level.code, module) ?? testReason(module.title, module.description);
    if (reason) {
      flagModule(steps, module, reason);
      continue;
    }
    if (imported) restore(steps, "module", module, republish);
    else steps.push({ kind: "module", id: module.id, title: module.title, action: "keep", reason: "not from the A1 import and not recognised as test content; review manually" });
    for (const lesson of module.lessons) {
      const lessonImported = importIds.has(lesson.id);
      const lessonReason = lessonImported ? null : testReason(lesson.title, lesson.description);
      if (lessonReason) {
        flagLesson(steps, lesson, lessonReason);
        continue;
      }
      if (lessonImported) restore(steps, "lesson", lesson, republish);
      for (const activity of lesson.activities) {
        const own = importIds.has(activity.id);
        const activityReason = own ? null : testReason(activity.title, activity.instructions);
        if (activityReason) flagActivity(steps, activity, activityReason);
        else if (own) restore(steps, "activity", activity, republish);
      }
      for (const material of lesson.materials) {
        const materialReason = isDummyUrl(material.url) ? `dummy link ${material.url}` : testReason(material.title);
        if (materialReason) steps.push({ kind: "material", id: material.id, title: material.title, action: "delete", reason: materialReason });
      }
    }
  }
  return steps;
}
