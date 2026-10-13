import { prisma } from "../../../src/lib/prisma.js";
import { demoLevels } from "../../demo-demo-levels.js";
import { writeBackup } from "../backup.js";
import { lessonActivities } from "./activities.js";
import { estimateMinutes, renderLessonBody } from "./body.js";
import { loadCourse, summarizeCourse } from "./course.js";
import { planExistingModules } from "./existing-modules.js";
import { courseIds } from "./spec.js";
import type { CourseSpec } from "./spec.js";

/** Import an HTML course into its level. Dry-run unless `apply`; applying backs up first. */
export async function importCourse(spec: CourseSpec, { apply }: { apply: boolean }) {
  const course = await loadCourse(spec);
  const summary = summarizeCourse(spec, course);
  const ids = courseIds(spec);
  const found = await prisma.level.findUnique({ where: { code: spec.level } });
  const existing = found ? await prisma.module.findMany({
    where: { levelId: found.id },
    include: { lessons: { include: {
      materials: true, progress: true, assignments: { select: { id: true } },
      activities: { include: { submissions: true } },
    } } },
  }) : [];
  const importIds = new Set(course.module.map((m) => ids.module(m.nr)));
  const plan = planExistingModules(spec.level, existing.map((m) => ({
    ...m,
    hasStudentWork: m.lessons.some((l) => l.progress.length > 0 || l.assignments.length > 0
      || l.activities.some((a) => a.submissions.length > 0)),
  })), importIds, course.module.length);
  if (!apply) return { ...summary, mode: "dry-run", levelExists: !!found, existingModules: plan };

  // Create the level only when missing; never overwrite a configured level (fees, titles).
  const definition = demoLevels.find((level) => level.code === spec.level);
  if (!found && !definition) throw new Error(`Level ${spec.level} is missing and has no definition in demo-demo-levels.ts`);
  const level = found ?? await prisma.level.create({ data: { ...definition!, isActive: true } });
  const backup = await writeBackup(spec.backupName, { source: course.source, level, modules: existing });
  await prisma.$transaction(async (tx) => {
    for (const step of plan) {
      if (step.action === "delete") await tx.module.delete({ where: { id: step.id } });
      if (step.action === "move") await tx.module.update({ where: { id: step.id }, data: { order: step.order } });
      if (step.action !== "archive") continue;
      await tx.module.update({ where: { id: step.id }, data: { isPublished: false, order: step.order } });
      await tx.lesson.updateMany({ where: { moduleId: step.id }, data: { isPublished: false } });
      await tx.activity.updateMany({ where: { lesson: { moduleId: step.id } }, data: { isPublished: false } });
      await tx.assessment.updateMany({ where: { lesson: { moduleId: step.id } }, data: { isPublished: false } });
    }
    for (const module of course.module) {
      const data = { levelId: level.id, title: module.titel, description: module.beschreibung, order: module.nr, isPublished: true };
      await tx.module.upsert({ where: { id: ids.module(module.nr) }, create: { id: ids.module(module.nr), ...data }, update: data });
    }
    for (const lesson of course.lektionen) {
      const data = {
        moduleId: ids.module(lesson.modul),
        title: `${lesson.thema} — ${lesson.titel}`,
        description: lesson.kurz,
        body: renderLessonBody(lesson),
        order: lesson.nr,
        contentType: "TEXT" as const,
        estimatedMinutes: estimateMinutes(lesson),
        isPublished: true,
      };
      const lessonId = ids.lesson(lesson.nr);
      await tx.lesson.upsert({ where: { id: lessonId }, create: { id: lessonId, ...data }, update: data });
      for (const { id, ...activity } of lessonActivities(lesson, course.source.file, ids.id)) {
        await tx.activity.upsert({ where: { id }, create: { id, lessonId, ...activity }, update: { lessonId, ...activity } });
      }
    }
    await tx.auditLog.create({ data: {
      action: "CURRICULUM_IMPORTED", entityType: "Level", entityId: level.id, reason: `${spec.level} course import`,
      after: { ...summary, existingModules: plan },
    } });
  }, { timeout: 120_000 });
  return { ...summary, mode: "applied", backup, existingModules: plan };
}
