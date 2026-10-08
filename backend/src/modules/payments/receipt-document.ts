import { env } from '../../config/env.js';
import { Prisma } from '../../generated/prisma/client.js';
import { notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import type { ReceiptLine } from './receipt-lines.js';
import { receiptLines } from './receipt-lines.js';

const ZERO = new Prisma.Decimal(0);
const sum = (rows: { amount: Prisma.Decimal }[]) => rows.reduce((total, row) => total.plus(row.amount), ZERO);
const fullName = (user: { firstName: string; lastName: string } | null) => user ? `${user.firstName} ${user.lastName}`.trim() : null;

export interface ReceiptDocument {
  id: string; receiptNumber: string; issuedAt: Date; paidAt: Date; voidedAt: Date | null;
  amount: number; currency: string; method: string; reference: string | null;
  payer: { name: string; studentCode: string; email: string };
  description: string; detail: string | null; lines: ReceiptLine[]; receivedBy: string | null; notes: string | null;
  summary: { fees: number; paid: number; balance: number };
  verifyUrl: string; appHost: string;
}

/** Everything printed on a receipt. Account totals are a snapshot from when it was issued, so a receipt never changes later. */
export async function loadReceiptDocument(id: string): Promise<ReceiptDocument> {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: {
    issuedBy: { select: { firstName: true, lastName: true } },
    payment: { include: {
      method: { select: { name: true } }, receivedBy: { select: { firstName: true, lastName: true } },
      student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true, email: true } } } },
      enrollment: { select: { level: { select: { code: true, title: true } }, intake: { select: { name: true } } } },
    } },
  } });
  if (!receipt) throw notFound('Receipt not found');
  const { payment } = receipt;
  const studentId = payment.student.id;
  // Snapshot = the account as recorded when this receipt was issued. Using record times (not the
  // payment date) keeps it right for back-dated cash payments entered after the charges.
  const asOf = receipt.issuedAt;
  const [charges, discounts, payments] = await Promise.all([
    prisma.charge.findMany({ where: { studentId, createdAt: { lte: asOf } }, select: { id: true, type: true, description: true, amount: true, dueDate: true, createdAt: true } }),
    prisma.discount.findMany({ where: { studentId, status: 'APPROVED', OR: [{ approvedAt: { lte: asOf } }, { approvedAt: null, createdAt: { lte: asOf } }] }, select: { amount: true } }),
    prisma.payment.findMany({ where: { studentId, createdAt: { lte: payment.createdAt } }, select: { id: true, amount: true, txnType: true } }),
  ]);
  const fees = sum(charges).minus(sum(discounts));
  const others = payments.filter(row => row.id !== payment.id);
  const paidBefore = sum(others.filter(row => row.txnType === 'PAYMENT')).minus(sum(others.filter(row => row.txnType === 'REFUND')));
  const paid = sum(payments.filter(row => row.txnType === 'PAYMENT')).minus(sum(payments.filter(row => row.txnType === 'REFUND')));
  const base = env.PUBLIC_APP_URL.replace(/\/$/, '');
  const course = payment.enrollment;
  return {
    id: receipt.id, receiptNumber: receipt.receiptNumber, issuedAt: receipt.issuedAt, paidAt: payment.paidAt, voidedAt: receipt.voidedAt,
    amount: payment.amount.toNumber(), currency: payment.currency, method: payment.method.name, reference: payment.reference,
    payer: { name: fullName(payment.student.user) ?? '', studentCode: payment.student.studentCode, email: payment.student.user.email },
    description: course ? `Course fee · ${course.level.code} ${course.level.title}` : 'Course fees payment',
    detail: course ? `Intake: ${course.intake.name}` : null,
    lines: payment.txnType === 'PAYMENT' ? receiptLines(charges, sum(discounts).plus(paidBefore), payment.amount) : [],
    receivedBy: fullName(payment.receivedBy) ?? fullName(receipt.issuedBy),
    notes: receipt.notes ?? payment.notes,
    summary: { fees: fees.toNumber(), paid: paid.toNumber(), balance: fees.minus(paid).toNumber() },
    verifyUrl: `${base}/verify/receipt/${receipt.id}`, appHost: new URL(base).host,
  };
}
