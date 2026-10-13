import type { Prisma } from "../../src/generated/prisma/client.js";
import { prisma } from "../../src/lib/prisma.js";
import { a1Id as id, loadA1Manifest } from "./a1-manifest.js";
import { writeBackup } from "./backup.js";
import { structureExercise } from "./structured-exercises.js";

/** Import the A1 coursebook. Dry-run unless `apply` is set; applying backs up first. */
export async function importA1({ apply }: { apply: boolean }) {
  const { book, checks } = await loadA1Manifest();
  const level = await prisma.level.findFirstOrThrow({ where: { code: "A1" } });
  const existing = await prisma.module.findMany({
    where: { levelId: level.id },
    include: {
      lessons: {
        include: {
          assessments: true, materials: true,
          progress: true,
          activities: { include: { submissions: true } },
        },
      },
    },
  });
  const summary = {
    level: level.code,
    modules: book.parts.length,
    units: book.units.length,
    exercises: book.units.reduce((n, u) => n + u.exercises.length, 0),
    quickChecks: checks.length,
  };
  if (!apply) return { ...summary, mode: "dry-run", existingModules: existing.length };
  const backup = await writeBackup("a1", { source: book.sha256, level, modules: existing });
  await prisma.$transaction(
    async (tx) => {
      const currentIds = book.parts.map((p) => id(`part:${p.number}`));
      // Archive demo records instead of losing submissions or completion history.
      const old = existing.filter((m) => !currentIds.includes(m.id));
      for (const [index, module] of old.entries()) {
        await tx.module.update({
          where: { id: module.id },
          data: { isPublished: false, order: module.order < 0 ? module.order : Math.min(-999, ...existing.map(m => m.order)) - 1 - index },
        });
        await tx.lesson.updateMany({
          where: { moduleId: module.id },
          data: { isPublished: false },
        });
        await tx.assessment.updateMany({ where: { lesson: { moduleId: module.id } }, data: { isPublished: false } });
        await tx.activity.updateMany({
          where: { lesson: { moduleId: module.id } },
          data: { isPublished: false },
        });
      }
      for (const part of book.parts) {
        const data = {
          levelId: level.id,
          title: part.title,
          order: part.number,
          description: `Units ${part.from}–${part.to} · ${book.source}`,
          isPublished: true,
        };
        await tx.module.upsert({
          where: { id: id(`part:${part.number}`) },
          create: { id: id(`part:${part.number}`), ...data },
          update: data,
        });
      }
      for (const unit of book.units) {
        const lessonId = id(`unit:${unit.number}`);
        const data = {
          moduleId: id(`part:${unit.part}`),
          title: unit.title,
          description: `Kursbuch · pp. ${unit.pages[0]}–${unit.pages.at(-1)}`,
          body: unit.body,
          order: unit.number,
          contentType: "TEXT" as const,
          estimatedMinutes: 20,
          isPublished: true,
        };
        await tx.lesson.upsert({
          where: { id: lessonId },
          create: { id: lessonId, ...data },
          update: data,
        });
        const check = checks[unit.number - 1];
        const options = check.slice(1);
        const rotate = unit.number % options.length;
        const shuffled = [...options.slice(rotate), ...options.slice(0, rotate)];
        const config = {
          practiceMode: true,
          source: book.source,
          unit: unit.number,
          options: shuffled,
          correctIndex: shuffled.indexOf(check[1]),
          explanation: check[1],
        };
        const quick = {
          lessonId,
          title: "Quick check",
          instructions: check[0],
          type: "MCQ" as const,
          config,
          order: 0,
          isPublished: true,
        };
        await tx.activity.upsert({
          where: { id: id(`check:${unit.number}`) },
          create: { id: id(`check:${unit.number}`), ...quick },
          update: quick,
        });
        for (const [index, exercise] of unit.exercises.entries()) {
          const exerciseData = {
            lessonId,
            title: unit.number === 49 ? `Practice ${exercise.key}` : `Ü${exercise.key}`,
            instructions: exercise.prompt,
            type: exercise.options ? "MCQ" as const : "WRITING" as const,
            order: index + 1,
            isPublished: true,
            config: {
              practiceMode: true,
              source: book.source,
              sourcePages: unit.pages,
              modelAnswer: exercise.modelAnswer,
              ...structureExercise(exercise),
              ...(exercise.options ? { options: exercise.options, correctIndex: exercise.correctIndex, explanation: exercise.options[exercise.correctIndex ?? 0] } : {}),
            } as Prisma.InputJsonObject,
          };
          await tx.activity.upsert({
            where: { id: id(`exercise:${exercise.key}`) },
            create: { id: id(`exercise:${exercise.key}`), ...exerciseData },
            update: exerciseData,
          });
        }
      }
      await tx.auditLog.create({ data: { action: 'CURRICULUM_IMPORTED', entityType: 'Level',
        entityId: level.id, reason: 'A1 coursebook import',
        after: { ...summary, source: book.source, sha256: book.sha256 } } });
    },
    { timeout: 120_000 },
  );
  return { ...summary, mode: "applied", backup };
}
