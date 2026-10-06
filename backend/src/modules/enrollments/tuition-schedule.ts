import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";

export const installmentSchema = z.object({ amount: z.coerce.number().positive(), dueDate: z.coerce.date() });
export const installmentsSchema = z.array(installmentSchema).min(1).max(24);
type Installment = z.infer<typeof installmentSchema>;

export async function writeTuitionSchedule(tx: Prisma.TransactionClient, input: {
  studentId: string; enrollmentId: string; totalFee: Prisma.Decimal; currency: string;
  installments?: Installment[]; dueDate: Date; description: string; actorId?: string;
}) {
  const rows = input.installments ?? [{ amount: input.totalFee.toNumber(), dueDate: input.dueDate }];
  const sum = rows.reduce((total, row) => total.plus(row.amount), new Prisma.Decimal(0));
  if (!sum.equals(input.totalFee)) throw badRequest("Instalment amounts must equal total tuition");
  if (rows.some((row, i) => i > 0 && row.dueDate <= rows[i - 1].dueDate)) throw badRequest("Instalment due dates must be in increasing order");
  const original = await tx.charge.findFirst({ where: { enrollmentId: input.enrollmentId, type: "TUITION" }, orderBy: { createdAt: "asc" } });
  await tx.charge.deleteMany({ where: { enrollmentId: input.enrollmentId, type: "TUITION" } });
  await tx.charge.createMany({ data: rows.map((row, i) => ({ studentId: input.studentId,
    enrollmentId: input.enrollmentId, type: "TUITION", currency: input.currency,
    createdAt: original?.createdAt, amount: new Prisma.Decimal(row.amount), dueDate: row.dueDate, createdById: input.actorId,
    description: rows.length > 1 ? `${input.description} — instalment ${i + 1}/${rows.length}` : input.description,
  })) });
}
