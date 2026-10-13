import type { Application,Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { generateOpaqueToken,generateStudentCode } from "../../lib/ids.js";
import { hashPassword } from "../../lib/password.js";
import { transact } from "../../lib/transactions.js";
import { createEnrollmentTx } from "../enrollments/enrollment-commands.js";
import type { AccountInvite } from "./account-invite.js";
import { issueAccountInvite } from "./account-invite.js";
import type { CreateStudentFromApplicationInput } from "./applications.schema.js";

/** Reuse the registration shape: PENDING user + student with a zeroed financial profile. */
async function createStudentAccount(tx: Prisma.TransactionClient, app: Application, passwordHash: string, actorId?: string) {
  if (!app.campusId) throw badRequest("Choose a campus on the application before creating the account");
  const user = await tx.user.create({
    data: { email: app.email, phone: app.phone, firstName: app.firstName, lastName: app.lastName, passwordHash, role: "STUDENT", status: "PENDING" },
  });
  const studentCode = await generateStudentCode(tx);
  const student = await tx.student.create({
    data: {
      userId: user.id, studentCode, campusId: app.campusId, intakeId: app.intakeId, intendedLevelId: app.levelId,
      shift: app.shift ?? "EVENING", status: "PENDING", finance: { create: {} },
    },
  });
  await writeAuditTx(tx, {
    actorId, action: "STUDENT_REGISTERED", entityType: "Student", entityId: student.id,
    after: { studentCode, email: app.email, via: "application", reference: app.reference },
  });
  return { studentId: student.id, studentCode, user };
}

export interface CreatedFromApplication {
  studentId: string;
  studentCode: string;
  accountCreated: boolean;
  enrollmentId: string | null;
  status: string;
  invite: AccountInvite | null;
}

/**
 * Turn an accepted application into a student. An existing student with the same email is
 * linked instead of duplicated; optionally enrol straight away (which marks it ENROLLED).
 */
export const createStudentFromApplication = async (
  id: string,
  input: CreateStudentFromApplicationInput,
  actorId?: string,
): Promise<CreatedFromApplication> => {
  const passwordHash = await hashPassword(generateOpaqueToken());
  const result = await transact(async (tx) => {
    const app = await tx.application.findUnique({ where: { id } });
    if (!app) throw notFound("Application not found");
    if (app.status !== "ACCEPTED") throw badRequest("Accept the application before creating the student account");
    if (app.studentId) throw conflict("This application is already linked to a student");

    const existing = await tx.user.findUnique({ where: { email: app.email }, include: { student: { select: { id: true, studentCode: true } } } });
    if (existing && !existing.student) throw conflict("This email belongs to a staff account. Ask the applicant for another email.");
    const account = existing?.student
      ? { studentId: existing.student.id, studentCode: existing.student.studentCode, user: null }
      : await createStudentAccount(tx, app, passwordHash, actorId);

    let enrollmentId: string | null = null;
    if (input.enroll) {
      if (!app.levelId || !app.intakeId) throw badRequest("Set the level and intake on the application before enrolling");
      const enrollment = await createEnrollmentTx(tx, {
        studentId: account.studentId, levelId: app.levelId, intakeId: app.intakeId, campusId: app.campusId ?? undefined,
        classGroupId: input.classGroupId, windowOverrideReason: input.windowOverrideReason,
      }, actorId);
      enrollmentId = enrollment.id;
    }

    const status = enrollmentId ? "ENROLLED" : app.status;
    await tx.application.update({ where: { id }, data: { studentId: account.studentId, status, reviewedById: actorId ?? null, reviewedAt: new Date() } });
    await writeAuditTx(tx, {
      actorId, action: "APPLICATION_STUDENT_LINKED", entityType: "Application", entityId: id,
      before: { status: app.status, studentId: null },
      after: { status, studentId: account.studentId, accountCreated: Boolean(account.user), enrollmentId },
    });
    return { ...account, enrollmentId, status };
  });

  const invite = result.user ? await issueAccountInvite(result.user) : null;
  return {
    studentId: result.studentId, studentCode: result.studentCode, accountCreated: Boolean(result.user),
    enrollmentId: result.enrollmentId, status: result.status, invite,
  };
};
