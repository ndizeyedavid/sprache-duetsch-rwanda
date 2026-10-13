import type { Prisma } from "../../generated/prisma/client.js";

/**
 * Reserve the next application reference, e.g. `APP-2026-0001`, on the same persistent
 * IdentifierCounter used for student codes and receipts, so a number is never reused.
 */
export async function generateApplicationReference(tx: Prisma.TransactionClient, when = new Date()): Promise<string> {
  const prefix = `APP-${when.getUTCFullYear()}-`;
  const counter = await tx.identifierCounter.upsert({
    where: { prefix },
    create: { prefix, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${prefix}${String(counter.value).padStart(4, "0")}`;
}
