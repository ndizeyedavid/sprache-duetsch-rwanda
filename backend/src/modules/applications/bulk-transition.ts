// The same decision for several applications at once (e.g. withdraw test entries, start reviewing a
// batch). Each one goes through the normal transition (policy, audit, applicant email), so an
// application that cannot take that step is skipped with the reason instead of failing the batch.
import { z } from "zod";
import { AppError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { applicationStatusEnum } from "./applications.schema.js";
import { transitionApplication } from "./transition-application.js";

export const bulkTransitionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: applicationStatusEnum,
  reason: z.string().trim().max(500).optional(),
});
export type BulkTransitionInput = z.infer<typeof bulkTransitionSchema>;

export async function bulkTransition(input: BulkTransitionInput, actorId?: string) {
  const rows = await prisma.application.findMany({ where: { id: { in: input.ids } }, select: { id: true, reference: true } });
  const references = new Map(rows.map((row) => [row.id, row.reference]));
  const changed: string[] = [];
  const skipped: { id: string; reference: string; reason: string }[] = [];
  for (const id of input.ids) {
    const reference = references.get(id);
    if (!reference) { skipped.push({ id, reference: "—", reason: "Application not found" }); continue; }
    try {
      await transitionApplication(id, { status: input.status, reason: input.reason || undefined }, actorId);
      changed.push(id);
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      skipped.push({ id, reference, reason: error.message });
    }
  }
  return { changed, skipped };
}
