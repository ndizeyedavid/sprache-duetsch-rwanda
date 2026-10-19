import type { Application, Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";
import { queueAccountInvite } from "./account-invite.js";
import { createStudentAccount } from "./create-student-account.js";

/** Create a pending account and durable setup email together with the application.
 * Existing accounts are never changed. Admissions links the account by email after
 * approval; creating an account does not grant course access or charge a fee.
 */
export async function ensureApplicantAccount(tx: Prisma.TransactionClient, application: Application, passwordHash: string): Promise<void> {
  const existing = await tx.user.findUnique({ where: { email: application.email }, select: { id: true } });
  if (existing) return;

  const campus = application.campusId
    ? { id: application.campusId }
    : await tx.campus.findFirst({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true } });
  if (!campus) throw badRequest("Student accounts are temporarily unavailable. Please contact admissions.");

  // No password is emailed or returned; only the recipient of the setup link can sign in.
  const account = await createStudentAccount(tx, { ...application, campusId: campus.id }, passwordHash);
  await queueAccountInvite(tx, account.user);
}
