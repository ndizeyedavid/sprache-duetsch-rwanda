import { prisma } from "../src/lib/prisma.js";
import { paymentMethods } from './base-payment-methods.js';
export const seedPaymentMethods = async () => {
  const byCode = new Map<string, string>();
  for (const method of paymentMethods) {
    const record = await prisma.paymentMethodConfig.upsert({
      where: { code: method.code },
      update: { ...method, isActive: true },
      create: { ...method, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};
