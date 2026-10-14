import { env } from "../../config/env.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { refreshFinanceProfiles } from "../../lib/finance.js";
import { invoiceUrl } from "../../lib/invoice-link.js";
import { notifyMessages } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type {
RunRemindersInput
} from "./payments.schema.js";
import { currencyLabel } from "./receipt-format.js";

type ReminderRow = { studentId: string; balance: Prisma.Decimal; overdueAmount: Prisma.Decimal; nextDueAmount: Prisma.Decimal; nextDueAt: Date | null; currency: string };
const dueDate = (date: Date | null) => date?.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: env.REMINDER_TIMEZONE }) ?? "soon";

/** In-app text plus the richer email: amount rows and a button to the public invoice with Pay now. */
export const reminderMessage = (row: ReminderRow, dueSoon: boolean) => {
  const money = (value: Prisma.Decimal) => currencyLabel(value.toNumber(), row.currency);
  const overdue = row.overdueAmount.greaterThan(0);
  const body = dueSoon
    ? `Your next payment of ${money(row.nextDueAmount)} is due on ${dueDate(row.nextDueAt)}. Your remaining balance is ${money(row.balance)}.\n\nOpen your invoice to see the details and pay securely with MTN MoMo or Airtel Money.`
    : `${overdue ? `You have an overdue amount of ${money(row.overdueAmount)}. ` : ""}Your remaining balance is ${money(row.balance)}.\n\nOpen your invoice to see each charge and pay securely with MTN MoMo or Airtel Money. You can pay the full amount or in parts.`;
  return { body, email: {
    details: [
      ...(dueSoon ? [{ label: "Next payment", value: money(row.nextDueAmount) }, { label: "Due date", value: dueDate(row.nextDueAt) }] : []),
      ...(overdue ? [{ label: "Overdue now", value: money(row.overdueAmount), emphasis: true }] : []),
      { label: "Remaining balance", value: money(row.balance), emphasis: !overdue },
    ],
    action: { label: "View invoice & pay", url: invoiceUrl(row.studentId) },
    footnote: "Already paid? Mobile-money payments can take a few minutes to confirm, and you can ignore this reminder. For questions about your fees, contact the finance office.",
  } };
};
export const runPaymentReminders = async (input: RunRemindersInput, actorId?: string) => {
  await refreshFinanceProfiles();
  const where: Prisma.StudentFinanceWhereInput = { balance: { gt: 0 } };
  if (input.overdueOnly) where.overdueAmount = { gt: 0 };
  if (input.dueSoon) where.nextDueAt = { gte: new Date(), lte: new Date(Date.now() + env.PAYMENT_REMINDER_LEAD_DAYS * 86400000) };

  const rows = await prisma.studentFinance.findMany({
    where,
    select: {
      studentId: true, balance: true, overdueAmount: true, nextDueAmount: true, nextDueAt: true,
      currency: true,
      student: { select: { userId: true } },
    },
  });

  let queued = 0;
  if (rows.length > 0) {
    const result = await notifyMessages(rows.map(row => ({
      userId: row.student.userId,
      input: {
        eventKey: `payment:${input.dueSoon ? "upcoming" : "balance"}:${new Date().toISOString().slice(0, 10)}:${row.balance.toString()}`,
        type: "PAYMENT" as const,
        title: input.dueSoon ? "Upcoming payment reminder" : row.overdueAmount.greaterThan(0) ? "Your payment is overdue" : "Outstanding balance reminder",
        ...reminderMessage(row, Boolean(input.dueSoon)),
        data: { balance: row.balance.toString(), currency: row.currency },
      },
    })));
    queued = result.count;
  }

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_REMINDERS_QUEUED",
    entityType: "StudentFinance",
    entityId: "bulk",
    after: { queued, selected: rows.length, overdueOnly: input.overdueOnly ?? false },
  });

  return { sent: queued, queued, selected: rows.length };
};
