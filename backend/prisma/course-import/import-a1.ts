import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { structureExercise } from "./structured-exercises.js";
import { createHash } from "node:crypto";
import { prisma } from "../../src/lib/prisma.js";
import type { Prisma } from "../../src/generated/prisma/client.js";

type Unit = {
  number: number;
  title: string;
  body: string;
  part: number;
  pages: number[];
  exercises: { key: string; prompt: string; modelAnswer: string | null; options?: string[] | null; correctIndex?: number | null }[];
};
type Manifest = {
  source: string;
  sha256: string;
  units: Unit[];
  parts: { number: number; title: string; from: number; to: number }[];
};
const dir = fileURLToPath(new URL(".", import.meta.url));
const book = JSON.parse(await readFile(`${dir}a1-course.json`, "utf8")) as Manifest;
const checks = JSON.parse(await readFile(`${dir}checks.json`, "utf8")) as string[][];
function id(key: string) {
  const h = createHash("sha256").update(`sparch:a1:book:v1:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
if (
  book.units.length !== 50 ||
  checks.length !== 50 ||
  book.units.some((u, i) => u.number !== i + 1 || !u.body || !checks[i]?.[1])
) {
  throw new Error("Invalid or incomplete course manifest");
}
try {
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
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ ...summary, mode: "dry-run", existingModules: existing.length }));
  } else {
    const backupDir = fileURLToPath(new URL("../../backups/", import.meta.url));
    await mkdir(backupDir, { recursive: true });
    const backup = `${backupDir}a1-${new Date().toISOString().replaceAll(":", "-")}.json`;
    await writeFile(
      backup,
      JSON.stringify({ source: book.sha256, level, modules: existing }, null, 2),
      { mode: 0o600 },
    );
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
    console.log(JSON.stringify({ ...summary, mode: "applied", backup }));
  }
} finally {
  await prisma.$disconnect();
}
