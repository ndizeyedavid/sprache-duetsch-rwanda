import { writeAuditTx } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
export const disablePaymentMethod = async (id: string, actorId?: string) => transact(async tx => {
  const before = await tx.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment method not found");
  }

  const method = await tx.paymentMethodConfig.update({
    where: { id },
    data: { isActive: false },
  });

  await writeAuditTx(tx, {
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_DISABLED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    before,
    after: method,
  });

  return method;
});
