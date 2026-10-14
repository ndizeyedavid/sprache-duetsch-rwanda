import { prisma } from "../../src/lib/prisma.js";
import { buildCertificateSnapshot } from "../../src/modules/certificates/certificate-snapshot.js";
import { demoStudents } from "./accounts.js";
import type { DemoContext } from "./context.js";
import { daysFromNow } from "./context.js";

/** Reads lessons in course order and records progress rows; lessons themselves are never modified. */
export async function seedProgress(ctx: DemoContext) {
  for (const level of ["A1", "B1"] as const) {
    const lessons = await prisma.lesson.findMany({
      where: { isPublished: true, module: { levelId: ctx.levels.get(level)!, isPublished: true } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }], select: { id: true },
    });
    for (const seed of demoStudents.filter((s) => s.level === level && s.lessonsDone > 0)) {
      const studentId = ctx.students.get(seed.key)!.studentId;
      const done = Math.min(seed.lessonsDone, lessons.length);
      const rows = lessons.slice(0, done + 1).map((lesson, index) => ({
        studentId, lessonId: lesson.id, status: index < done ? ("COMPLETED" as const) : ("IN_PROGRESS" as const),
        secondsWatched: index < done ? 900 : 240, completedAt: index < done ? daysFromNow(-40 + index * 2) : null,
      }));
      await prisma.lessonProgress.createMany({ data: rows, skipDuplicates: true });
    }
  }
}

const HOMEWORK = [
  { title: "DEMO · Stell dich vor", responseType: "TEXT" as const, due: -4,
    instructions: "Write 5–7 sentences about yourself: name, city, languages and one hobby." },
  { title: "DEMO · Meine Woche (Audio)", responseType: "AUDIO" as const, due: 5,
    instructions: "Record 30–60 seconds about your week. Use at least three days of the week." },
];

/** Homework per class with graded, submitted and late work so grading queues are never empty. */
export async function seedHomework(ctx: DemoContext) {
  const rubric = [{ title: "Task completed", description: "All requested information is there.", points: 5 },
    { title: "German", description: "Correct verb forms and capitalised nouns.", points: 5 }];
  for (const level of ["A1", "B1"] as const) {
    const teacherId = ctx.staff.get(level === "A1" ? "teacherA1" : "teacherB1")!;
    for (const task of HOMEWORK) {
      const assignment = await prisma.assignment.create({
        data: {
          classGroupId: ctx.classes.get(level)!, createdById: teacherId, title: task.title, instructions: task.instructions,
          responseType: task.responseType, status: "PUBLISHED", dueAt: daysFromNow(task.due), releaseAt: daysFromNow(-10),
          maxPoints: 10, allowLate: true, latePenaltyPercentPerDay: 10, latePenaltyMaxPercent: 50, rubric,
        },
      });
      if (task.responseType !== "TEXT") continue;
      const roster = demoStudents.filter((s) => s.level === level && s.inClass && s.status === "ACTIVE");
      for (const [index, seed] of roster.entries()) {
        const graded = index % 3 === 0;
        const submitted = index % 3 !== 2 || level === "B1";
        if (!submitted) continue;
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id, studentId: ctx.students.get(seed.key)!.studentId, status: graded ? "GRADED" : "SUBMITTED",
            text: `Hallo! Ich heiße ${seed.firstName}. Ich wohne in Kigali. Ich spreche Kinyarwanda, Englisch und ein bisschen Deutsch.`,
            revision: 1, submittedAt: daysFromNow(index === 1 ? -2 : -5), score: graded ? 8 : null, rawScore: graded ? 8 : null,
            latePenaltyPercent: index === 1 ? 20 : null, feedback: graded ? "Sehr schön! Achte auf die Großschreibung." : null,
            gradedAt: graded ? daysFromNow(-3) : null,
          },
        });
      }
    }
  }
}

/** Certificate for the graduate (same snapshot the real issuer stores, so PDF + verify work). */
export async function seedCertificate(ctx: DemoContext) {
  const ids = ctx.students.get("graduate")!;
  const levelId = ctx.levels.get("A1")!;
  const issuer = ctx.staff.get("academic")!;
  const input = { studentId: ids.studentId, levelId, enrollmentId: ids.enrollmentId ?? undefined };
  const document = await buildCertificateSnapshot(input, issuer);
  await prisma.certificate.create({
    data: {
      certificateNumber: "DEMO-CERT-0001", verificationCode: "DEMO2026A1CERT01", studentId: ids.studentId, levelId,
      enrollmentId: ids.enrollmentId, issuedById: issuer, issuedAt: daysFromNow(-10),
      metadata: { document, completionPercentage: 100, finalExamPassed: true },
    },
  });
  await prisma.placementResult.create({
    data: { studentId: ids.studentId, source: "MANUAL", score: 18, recommendedLevelId: levelId, assignedLevelId: levelId,
      decidedById: issuer, decidedAt: daysFromNow(-150), note: "Complete beginner (demo)" },
  });
}
