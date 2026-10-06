import type { Prisma } from '../../generated/prisma/client.js';
import type { EmitActivityInput } from './activity.service.js';

/** Persist the feed event with the mutation, so retries cannot duplicate it. */
export async function writeActivityTx(tx: Prisma.TransactionClient, input: EmitActivityInput) {
  const actor = input.actorId ? await tx.user.findUnique({ where: { id: input.actorId }, select: { firstName: true, lastName: true } }) : null;
  return tx.activityEvent.create({ data: { ...input,
    actorName: input.actorName ?? (actor ? `${actor.firstName} ${actor.lastName}`.trim() : null),
  } });
}
