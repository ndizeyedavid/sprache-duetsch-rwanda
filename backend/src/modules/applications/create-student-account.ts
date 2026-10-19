import type { Application, Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest } from "../../lib/http-error.js";
import { generateStudentCode } from "../../lib/ids.js";

/** Reuse the registration shape: PENDING user + student with a zeroed financial profile. */
export async function createStudentAccount(tx: Prisma.TransactionClient, app: Application, passwordHash: string, actorId?: string) {
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

