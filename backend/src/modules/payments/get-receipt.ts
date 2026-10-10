import type { Role } from "../../generated/prisma/client.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { receiptInclude } from './receipt-include.js';
export const getReceipt = async (id: string, user: { id: string; role: Role }) => {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: receiptInclude });
  if (!receipt) {
    throw notFound("Receipt not found");
  }

  if (user.role === "STUDENT" && receipt.payment.student.userId !== user.id) {
    throw forbidden("You can only view your own receipts");
  }

  return receipt;
};
