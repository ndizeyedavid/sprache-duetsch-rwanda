import { dateStamp } from "../../lib/ids.js";
import { notFound } from "../../lib/http-error.js";
import { verifyInvoiceToken } from "../../lib/invoice-link.js";
import { prisma } from "../../lib/prisma.js";
import { getStudentFinanceDetail } from "../payments/get-my-finance.js";
import type { CheckoutInput } from "../mobile-money/mobile-money.schema.js";
import { mobileMoneyConfig, startStudentCheckout } from "../mobile-money/mobile-money.service.js";
import { refreshCheckout } from "../mobile-money/refresh-checkout.js";

type Checkout = Awaited<ReturnType<typeof refreshCheckout>>;

// Anyone holding the emailed link can open the invoice, so the payer's number is never shown in full.
const maskPhone = (phone: string) => phone.length > 6 ? `${phone.slice(0, 3)}••••${phone.slice(-3)}` : "••••";
const publicCheckout = (row: Checkout) => ({
  id: row.id, amount: row.amount, currency: row.currency, phone: maskPhone(row.phone), requestKey: row.requestKey,
  status: row.status, provider: row.provider, providerRef: row.providerRef, failureReason: row.failureReason,
  paymentId: row.paymentId, createdAt: row.createdAt,
});

/** The invoice behind an emailed link: who it is for, what is owed per charge, and how to pay it now. */
export async function getInvoice(token: string) {
  const studentId = verifyInvoiceToken(token);
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: {
    studentCode: true, campus: { select: { name: true } }, user: { select: { firstName: true, lastName: true } },
  } });
  if (!student) throw notFound("This invoice is no longer available. Please contact the finance office.");
  const [detail, gateway, checkouts] = await Promise.all([
    getStudentFinanceDetail(studentId),
    mobileMoneyConfig(),
    prisma.paymentCheckout.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const finance = detail.finance;
  return {
    invoiceNumber: `INV-${student.studentCode}-${dateStamp()}`,
    issuedAt: new Date(),
    student: { name: `${student.user.firstName} ${student.user.lastName}`, studentCode: student.studentCode, campus: student.campus?.name ?? null },
    summary: finance ? {
      totalDue: finance.totalDue, totalDiscount: finance.totalDiscount, totalPaid: finance.totalPaid, balance: finance.balance,
      overdueAmount: finance.overdueAmount, nextDueAmount: finance.nextDueAmount, nextDueAt: finance.nextDueAt,
      currency: finance.currency, status: finance.status,
    } : null,
    lines: detail.charges.map(row => ({
      id: row.id, description: row.description, type: row.type, amount: row.amount,
      outstanding: row.outstanding, dueAt: row.dueAt, status: row.obligationStatus,
    })),
    mobileMoney: { enabled: gateway.enabled && finance?.currency === "RWF", minimumAmount: gateway.minimumAmount, testMode: gateway.testMode },
    checkouts: checkouts.map(publicCheckout),
  };
}

export async function payInvoice(token: string, input: CheckoutInput) {
  return publicCheckout(await startStudentCheckout(verifyInvoiceToken(token), input));
}

export async function checkInvoicePayment(token: string, checkoutId: string) {
  return publicCheckout(await refreshCheckout(checkoutId, verifyInvoiceToken(token)));
}
