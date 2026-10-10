import type { Prisma } from "../../generated/prisma/client.js";
import { assertStudentCurrency } from "../../lib/finance.js";
import { badRequest,notFound } from "../../lib/http-error.js";

export async function ledgerContext(tx: Prisma.TransactionClient, studentId: string, enrollmentId?: string, requested?: string) {
  const student = await tx.student.findUnique({ where: { id: studentId } });
  if (!student) throw notFound("Student not found");
  const enrollment = enrollmentId ? await tx.enrollment.findUnique({ where: { id: enrollmentId } }) : null;
  if (enrollmentId && (!enrollment || enrollment.studentId !== studentId)) throw badRequest("Enrollment does not belong to this student");
  const profile = await tx.studentFinance.findUnique({ where: { studentId } });
  const currency = await assertStudentCurrency(tx, studentId, requested ?? enrollment?.currency ?? profile?.currency ?? "RWF");
  return { student, enrollment, currency };
}

export async function validateMethod(tx: Prisma.TransactionClient, id: string, reference?: string | null) {
  const method = await tx.paymentMethodConfig.findUnique({ where: { id } });
  if (!method?.isActive) throw badRequest("Choose an active payment method");
  if (method.requiresReference && !reference?.trim()) throw badRequest("This payment method requires a transaction reference");
  return method;
}
