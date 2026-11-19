// One step from an open application to an enrolled student: save the course chosen in the review
// drawer, find the right student (the one staff picked from the matches, the linked one, the account
// the website made for this email, or a new account) and enrol them. A student already studying this
// level is linked rather than enrolled twice. The audit row records review, acceptance and enrolment.
import { z } from "zod";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { generateOpaqueToken } from "../../lib/ids.js";
import { hashPassword } from "../../lib/password.js";
import { transact } from "../../lib/transactions.js";
import { createEnrollmentTx } from "../enrollments/enrollment-commands.js";
import { issueAccountInvite } from "./account-invite.js";
import { OPEN_APPLICATION_STATUSES } from "./application-policy.js";
import { createStudentAccount } from "./create-student-account.js";
import { notifyEnrolled } from "./enrolled-notice.js";

const id = z.string().trim().uuid();
export const admitApplicationSchema = z.object({
  levelId: id, intakeId: id, campusId: id,
  classGroupId: z.preprocess((value) => (value === "" || value === null ? undefined : value), id.optional()),
  /** An existing student to enrol instead of the applicant's own account (a match staff confirmed). */
  studentId: z.preprocess((value) => (value === "" || value === null ? undefined : value), id.optional()),
  windowOverrideReason: z.string().trim().min(10).max(500).optional(),
});
export type AdmitApplicationInput = z.infer<typeof admitApplicationSchema>;

export async function admitApplication(applicationId: string, input: AdmitApplicationInput, actorId?: string) {
  const passwordHash = await hashPassword(generateOpaqueToken());
  const result = await transact(async (tx) => {
    const before = await tx.application.findUnique({ where: { id: applicationId } });
    if (!before) throw notFound("Application not found");
    if (!OPEN_APPLICATION_STATUSES.includes(before.status)) throw badRequest(`This application is ${before.status.toLowerCase()}; it can no longer be enrolled`);
    const app = await tx.application.update({ where: { id: applicationId }, data: { levelId: input.levelId, intakeId: input.intakeId, campusId: input.campusId } });

    const chosenId = input.studentId ?? app.studentId;
    let account: { studentId: string; studentCode: string; user: Awaited<ReturnType<typeof createStudentAccount>>["user"] | null };
    if (chosenId) {
      const student = await tx.student.findUnique({ where: { id: chosenId }, select: { id: true, studentCode: true } });
      if (!student) throw notFound("Student not found");
      account = { studentId: student.id, studentCode: student.studentCode, user: null };
    } else {
      const existing = await tx.user.findUnique({ where: { email: app.email }, include: { student: { select: { id: true, studentCode: true } } } });
      if (existing && !existing.student) throw conflict("This email belongs to a staff account. Ask the applicant for another email.");
      account = existing?.student ? { studentId: existing.student.id, studentCode: existing.student.studentCode, user: null }
        : await createStudentAccount(tx, app, passwordHash, actorId);
    }

    const live = await tx.enrollment.findFirst({ where: { studentId: account.studentId, levelId: input.levelId, status: "ACTIVE" }, select: { id: true } });
    const enrollment = live ?? await createEnrollmentTx(tx, {
      studentId: account.studentId, levelId: input.levelId, intakeId: input.intakeId, campusId: input.campusId,
      classGroupId: input.classGroupId, windowOverrideReason: input.windowOverrideReason,
    }, actorId);
    await tx.application.update({ where: { id: applicationId }, data: { studentId: account.studentId, status: "ENROLLED", reviewedById: actorId ?? null, reviewedAt: new Date() } });
    await writeAuditTx(tx, {
      actorId, action: "APPLICATION_ADMITTED", entityType: "Application", entityId: applicationId,
      before: { status: before.status, studentId: before.studentId },
      after: { status: "ENROLLED", studentId: account.studentId, enrollmentId: enrollment.id, accountCreated: Boolean(account.user), alreadyEnrolled: Boolean(live) },
      reason: input.windowOverrideReason,
    });
    return { ...account, enrollmentId: enrollment.id, alreadyEnrolled: Boolean(live) };
  });

  const invite = result.user ? await issueAccountInvite(result.user) : null;
  if (!result.alreadyEnrolled) await notifyEnrolled(result.studentId, result.enrollmentId);
  return {
    studentId: result.studentId, studentCode: result.studentCode, accountCreated: Boolean(result.user),
    enrollmentId: result.enrollmentId, alreadyEnrolled: result.alreadyEnrolled, status: "ENROLLED" as const, invite,
  };
}
