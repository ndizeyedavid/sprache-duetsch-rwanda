import { notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';

/**
 * Public receipt check behind the QR code. The receipt id is a random UUID, so it cannot be guessed;
 * still only the minimum is shown — no email, student number or balance.
 */
export async function verifyReceipt(id: string) {
  const receipt = await prisma.receipt.findUnique({ where: { id }, select: {
    receiptNumber: true, issuedAt: true, voidedAt: true,
    payment: { select: { amount: true, currency: true, paidAt: true, method: { select: { name: true } },
      student: { select: { user: { select: { firstName: true, lastName: true } } } },
      enrollment: { select: { level: { select: { code: true, title: true } } } } } },
  } });
  if (!receipt) throw notFound('No receipt matches this link');
  const { payment } = receipt;
  const { firstName, lastName } = payment.student.user;
  return {
    valid: !receipt.voidedAt,
    receiptNumber: receipt.receiptNumber,
    payerName: `${firstName} ${lastName.charAt(0)}.`.trim(),
    amount: payment.amount.toString(),
    currency: payment.currency,
    paidAt: payment.paidAt,
    issuedAt: receipt.issuedAt,
    method: payment.method.name,
    course: payment.enrollment ? `${payment.enrollment.level.code} · ${payment.enrollment.level.title}` : null,
    voidedAt: receipt.voidedAt,
  };
}
