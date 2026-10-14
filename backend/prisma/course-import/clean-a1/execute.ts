// Apply a cleanup plan in one transaction. Every delete re-checks "no student work" in its
// WHERE clause, so a submission that arrives between dry-run and apply is never cascaded away.
import { prisma } from "../../../src/lib/prisma.js";
import type { Action, Kind, Steps } from "./types.js";

const noLessonWork = {
  progress: { none: {} },
  assignments: { none: {} },
  activities: { none: { submissions: { some: {} } } },
};

export async function executeSteps(level: { id: string; code: string }, steps: Steps) {
  const ids = (kind: Kind, action: Action) => steps.filter((s) => s.kind === kind && s.action === action).map((s) => s.id);
  const anyOf = (kind: Kind, action: Action) => ({ id: { in: ids(kind, action) } });
  return prisma.$transaction(async (tx) => {
    const result = {
      deleted: {
        materials: (await tx.lessonMaterial.deleteMany({ where: anyOf("material", "delete") })).count,
        activities: (await tx.activity.deleteMany({ where: { ...anyOf("activity", "delete"), submissions: { none: {} } } })).count,
        lessons: (await tx.lesson.deleteMany({ where: { ...anyOf("lesson", "delete"), ...noLessonWork } })).count,
        modules: (await tx.module.deleteMany({ where: { ...anyOf("module", "delete"), lessons: { none: { NOT: noLessonWork } } } })).count,
        assessments: (await tx.assessment.deleteMany({ where: { ...anyOf("assessment", "delete"), attempts: { none: {} } } })).count,
        questions: (await tx.question.deleteMany({ where: { ...anyOf("question", "delete"), answers: { none: {} } } })).count,
        assignments: (await tx.assignment.deleteMany({ where: { ...anyOf("assignment", "delete"), submissions: { none: {} }, files: { none: {} } } })).count,
      },
      unpublished: {
        modules: (await tx.module.updateMany({ where: anyOf("module", "unpublish"), data: { isPublished: false } })).count,
        lessons: (await tx.lesson.updateMany({ where: anyOf("lesson", "unpublish"), data: { isPublished: false } })).count,
        activities: (await tx.activity.updateMany({ where: anyOf("activity", "unpublish"), data: { isPublished: false } })).count,
        assessments: (await tx.assessment.updateMany({ where: anyOf("assessment", "unpublish"), data: { isPublished: false } })).count,
      },
      republished: {
        modules: (await tx.module.updateMany({ where: anyOf("module", "republish"), data: { isPublished: true } })).count,
        lessons: (await tx.lesson.updateMany({ where: anyOf("lesson", "republish"), data: { isPublished: true } })).count,
        activities: (await tx.activity.updateMany({ where: anyOf("activity", "republish"), data: { isPublished: true } })).count,
      },
    };
    // Assessment.prerequisiteLessonId has no foreign key; clear references to deleted lessons.
    await tx.$executeRaw`UPDATE "Assessment" SET "prerequisiteLessonId" = NULL
      WHERE "levelId" = ${level.id} AND "prerequisiteLessonId" IS NOT NULL
      AND "prerequisiteLessonId" NOT IN (SELECT id FROM "Lesson")`;
    await tx.auditLog.create({ data: {
      action: "CURRICULUM_CLEANED", entityType: "Level", entityId: level.id,
      reason: `${level.code} test/demo content cleanup`,
      after: { ...result, steps: steps.filter((s) => s.action !== "keep") },
    } });
    return result;
  }, { timeout: 60_000 });
}
