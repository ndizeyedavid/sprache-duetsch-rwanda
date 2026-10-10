import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListPaymentMethodQuery
} from "./payments.schema.js";
export const listPaymentMethods = async (query: ListPaymentMethodQuery) => {
  const where: Prisma.PaymentMethodConfigWhereInput = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;

  return prisma.paymentMethodConfig.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
};
