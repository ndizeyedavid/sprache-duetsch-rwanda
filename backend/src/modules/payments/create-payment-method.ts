import { writeAuditTx } from "../../lib/audit.js";
import { conflict } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import type {
CreatePaymentMethodInput
} from "./payments.schema.js";
export const createPaymentMethod = async (
  input: CreatePaymentMethodInput,
  actorId?: string,
) => transact(async tx => {
  const existing = await tx.paymentMethodConfig.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A payment method with this code already exists");
  }

  const method = await tx.paymentMethodConfig.create({
    data: {
      code: input.code,
      name: input.name,
      requiresReference: input.requiresReference ?? false,
      instructions: input.instructions ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  await writeAuditTx(tx, {
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_CREATED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    after: method,
  });

  return method;
});
