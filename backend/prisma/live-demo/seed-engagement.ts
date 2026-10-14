import type { ApplicationStatus, NotificationType } from "../../src/generated/prisma/client.js";
import { prisma } from "../../src/lib/prisma.js";
import { DEMO_DOMAIN } from "./accounts.js";
import type { DemoContext } from "./context.js";
import { daysFromNow } from "./context.js";

const APPLICATIONS: { first: string; last: string; level: string; status: ApplicationStatus; reason?: string }[] = [
  { first: "Moses", last: "Kayitare", level: "A1", status: "NEW" },
  { first: "Claudine", last: "Mukeshimana", level: "A1", status: "REVIEWING" },
  { first: "Eric", last: "Niyonsaba", level: "B1", status: "WAITLISTED" },
  { first: "Josiane", last: "Uwase", level: "A2", status: "ACCEPTED" },
  { first: "Thierry", last: "Mugabo", level: "B2", status: "REJECTED", reason: "Duplicate application (demo)" },
];

/** Admissions queue, messages, notifications and activity feed entries. */
export async function seedEngagement(ctx: DemoContext) {
  const academicId = ctx.staff.get("academic")!;
  for (const [index, app] of APPLICATIONS.entries()) {
    const reviewed = app.status !== "NEW";
    await prisma.application.create({
      data: {
        reference: `DEMO-APP-${String(index + 1).padStart(4, "0")}`, firstName: app.first, lastName: app.last,
        email: `applicant${index + 1}@${DEMO_DOMAIN}`, phone: `+250 780 001 ${100 + index}`, campusId: ctx.campuses.get("NORRSKEN")!,
        levelId: ctx.levels.get(app.level) ?? null, intakeId: ctx.intakeId, shift: index % 2 ? "MORNING" : "EVENING",
        experience: index % 2 ? "Some German at school" : "Complete beginner", message: "I want to study in Germany. (demo)",
        source: index % 2 ? "CATALOG" : "WEBSITE", status: app.status, decisionReason: app.reason ?? null,
        reviewedById: reviewed ? academicId : null, reviewedAt: reviewed ? daysFromNow(-index) : null,
        waitlistedAt: app.status === "WAITLISTED" ? daysFromNow(-2) : null, createdAt: daysFromNow(-index - 3),
      },
    });
  }

  const student = ctx.students.get("student")!;
  const teacherId = ctx.staff.get("teacherA1")!;
  const financeId = ctx.staff.get("finance")!;
  const threads = [
    { other: teacherId, lines: [["s", "Guten Tag! Can I submit the homework tomorrow?"], ["o", "Ja, natürlich. Late penalty is 10% per day."], ["s", "Danke schön!"]] },
    { other: financeId, lines: [["o", "Hello Nella, we received your second instalment. You are fully paid!"], ["s", "Super, danke!"]] },
  ];
  for (const thread of threads) {
    const conversation = await prisma.conversation.create({
      data: { createdById: thread.other, participants: { create: [{ userId: student.userId }, { userId: thread.other, lastReadAt: new Date() }] } },
    });
    for (const [i, [who, body]] of thread.lines.entries()) {
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: who === "s" ? student.userId : thread.other, body, createdAt: daysFromNow(-3, 9 + i) },
      });
    }
  }

  const notes: [string, NotificationType, string, string, boolean][] = [
    ["student", "CLASS", "Live class now: Wohnen in Kigali", "Your A1 class has started. Tap to join on Google Meet.", false],
    ["student", "PAYMENT", "Payment received: 25,000 RWF", "Your tuition is now fully paid. Receipt DEMO-RCP is ready.", false],
    ["partial", "PAYMENT", "Instalment due in 14 days", "Balance: 25,000 RWF. Pay in full to unlock lessons and quizzes.", false],
    ["student", "ASSIGNMENT", "New homework: Meine Woche", "Record 30–60 seconds about your week.", true],
    ["overdue", "PAYMENT", "Payment overdue", "Your tuition balance is overdue. Please contact finance.", false],
    ["overdue", "CLASS", "Low attendance warning", "Your attendance is below 60%. Please talk to your teacher.", false],
    ["graduate", "SYSTEM", "Certificate issued", "Your A1 certificate DEMO-CERT-0001 is ready to download.", true],
  ];
  await prisma.notification.createMany({
    data: notes.map(([key, type, title, body, read]) => ({
      userId: ctx.students.get(key)!.userId, type, title, body, readAt: read ? daysFromNow(-1) : null,
    })),
  });

  const classA1 = ctx.classes.get("A1")!;
  const levelA1 = ctx.levels.get("A1")!;
  await prisma.activityEvent.createMany({
    data: [
      { type: "ANNOUNCEMENT", title: "Welcome to the A1 evening class!", body: "Classes run Mon/Wed 18:00 on Google Meet.", actorId: teacherId, actorName: "Clarisse Demo", classGroupId: classA1, levelId: levelA1, createdAt: daysFromNow(-20) },
      { type: "ASSIGNMENT", title: "New homework: Stell dich vor", actorId: teacherId, actorName: "Clarisse Demo", classGroupId: classA1, levelId: levelA1, createdAt: daysFromNow(-9) },
      { type: "PAYMENT", title: "Payment received: 20,000 RWF", actorId: financeId, actorName: "David Demo", studentId: student.studentId, createdAt: daysFromNow(-30) },
      { type: "SCHEDULE", title: "Class cancelled: Familie & Freunde", body: "Moved to next week.", actorId: teacherId, actorName: "Clarisse Demo", classGroupId: classA1, levelId: levelA1, createdAt: daysFromNow(-10) },
    ],
  });
}
