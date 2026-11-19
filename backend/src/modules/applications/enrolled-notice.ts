// Tells a student admitted from an application where they stand: the course and intake, and that the
// lessons open once tuition is paid (in the app, and by email when their settings allow it).
import { logger } from "../../lib/logger.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { appUrl } from "./application-mail.js";

export async function notifyEnrolled(studentId: string, enrollmentId: string): Promise<void> {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, studentId },
      select: { totalFee: true, level: { select: { title: true } }, intake: { select: { name: true } }, student: { select: { userId: true } } },
    });
    if (!enrollment) return;
    const free = enrollment.totalFee.isZero();
    await notifyUser(enrollment.student.userId, {
      type: "SYSTEM",
      title: `You are enrolled in ${enrollment.level.title}`,
      body: `Welcome! You are enrolled in ${enrollment.level.title} (${enrollment.intake.name}). ${free
        ? "Your lessons are open now."
        : "Your lessons open as soon as your tuition is paid: see Payments in the app."}`,
      data: { kind: "enrolment", enrollmentId },
      eventKey: `enrolment:${enrollmentId}:admitted`,
      email: { action: free ? { label: "Start learning", url: `${appUrl()}/courses` } : { label: "Open Payments", url: `${appUrl()}/payments` } },
    });
  } catch (error) {
    logger.error({ error, enrollmentId }, "Enrolment notice failed");
  }
}
