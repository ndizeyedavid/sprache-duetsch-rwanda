import { writeAuditTx } from "../../lib/audit.js";
import { conflict,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import type {
UpdatePaymentMethodInput
} from "./payments.schema.js";
export const updatePaymentMethod = async (
  id: string,
  input: UpdatePaymentMethodInput,
  actorId?: string,
) => transact(async tx => {
  const before = await tx.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment method not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await tx.paymentMethodConfig.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("A payment method with this code already exists");
    }
  }

  const method = await tx.paymentMethodConfig.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      requiresReference: input.requiresReference,
      instructions: input.instructions,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  await writeAuditTx(tx, {
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_UPDATED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    before,
    after: method,
  });

  return method;
});
