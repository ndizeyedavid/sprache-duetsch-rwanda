import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { paymentInclude } from './payment-include.js';
export const getPayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  if (!payment) {
    throw notFound("Payment not found");
  }
  return payment;
};
