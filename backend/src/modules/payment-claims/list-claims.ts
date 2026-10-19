import type { Prisma } from "../../generated/prisma/client.js";
import { andWhere,studentIntakeWhere } from "../../lib/intake-scope.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { resolveStudentId } from "../payments/resolve-student-id.js";
import type { ListClaimsQuery } from "./payment-claims.schema.js";

const include = {
  method: { select: { id: true, code: true, name: true } },
  reviewedBy: { select: { firstName: true, lastName: true } },
  payment: { select: { id: true, receipt: { select: { id: true, receiptNumber: true } } } },
} satisfies Prisma.PaymentClaimInclude;

/** Finance queue, oldest pending first so nobody waits; honours the staff intake scope. */
export async function listClaims(query: ListClaimsQuery) {
  const pagination = parsePagination(query);
  const where = andWhere<Prisma.PaymentClaimWhereInput>({ status: query.status, studentId: query.studentId },
    query.intakeId ? { student: studentIntakeWhere(query.intakeId) } : undefined);
  const [rows, total, pending] = await Promise.all([
    prisma.paymentClaim.findMany({ where, skip: pagination.skip, take: pagination.take,
      orderBy: query.status === "PENDING" ? { createdAt: "asc" } : { createdAt: "desc" },
      include: { ...include, student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        finance: { select: { balance: true, currency: true, status: true } } } } } }),
    prisma.paymentClaim.count({ where }),
    prisma.paymentClaim.count({ where: andWhere<Prisma.PaymentClaimWhereInput>({ status: "PENDING" }, query.intakeId ? { student: studentIntakeWhere(query.intakeId) } : undefined) }),
  ]);
  return { ...buildPaginated(rows, total, pagination), summary: { pending } };
}

/** The student's own reports, newest first. */
export async function listMyClaims(userId: string) {
  const studentId = await resolveStudentId(userId);
  return prisma.paymentClaim.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 50, include });
}
