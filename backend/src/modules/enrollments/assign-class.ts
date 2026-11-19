// Put several enrolments into one class (or take them out) in one go. Each enrolment goes through the
// normal update (level/intake/campus match, capacity, audit), so a full class or a mismatch skips that
// student with a reason instead of failing the whole batch.
import { z } from "zod";
import { AppError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { updateEnrollment } from "./enrollment-commands.js";

export const assignClassSchema = z.object({
  enrollmentIds: z.array(z.string().uuid()).min(1).max(200),
  classGroupId: z.string().uuid().nullable(),
});
export type AssignClassInput = z.infer<typeof assignClassSchema>;

export async function assignClass(input: AssignClassInput, actorId?: string) {
  const rows = await prisma.enrollment.findMany({
    where: { id: { in: input.enrollmentIds } },
    select: { id: true, student: { select: { user: { select: { firstName: true, lastName: true } } } } },
  });
  const names = new Map(rows.map((row) => [row.id, `${row.student.user.firstName} ${row.student.user.lastName}`.trim()]));
  const assigned: string[] = [];
  const skipped: { id: string; name: string; reason: string }[] = [];
  for (const id of input.enrollmentIds) {
    const name = names.get(id);
    if (!name) { skipped.push({ id, name: "Unknown enrolment", reason: "Enrolment not found" }); continue; }
    try {
      await updateEnrollment(id, { classGroupId: input.classGroupId }, actorId);
      assigned.push(id);
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      skipped.push({ id, name, reason: error.message });
    }
  }
  return { assigned, skipped };
}
