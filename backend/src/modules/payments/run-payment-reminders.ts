import { env } from "../../config/env.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { refreshFinanceProfiles } from "../../lib/finance.js";
import { notifyMessages } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type {
RunRemindersInput
} from "./payments.schema.js";
export const runPaymentReminders = async (input: RunRemindersInput, actorId?: string) => {
  await refreshFinanceProfiles();
  const where: Prisma.StudentFinanceWhereInput = { balance: { gt: 0 } };
  if (input.overdueOnly) where.overdueAmount = { gt: 0 };
  if (input.dueSoon) where.nextDueAt = { gte: new Date(), lte: new Date(Date.now() + env.PAYMENT_REMINDER_LEAD_DAYS * 86400000) };

  const rows = await prisma.studentFinance.findMany({
    where,
    select: {
      balance: true, overdueAmount: true, nextDueAmount: true, nextDueAt: true,
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
        title: input.dueSoon ? "Upcoming payment reminder" : "Outstanding balance reminder",
        body: input.dueSoon ? `Your next payment of ${row.nextDueAmount.toString()} ${row.currency} is due ${row.nextDueAt?.toISOString().slice(0, 10)}. Contact finance for payment instructions.` : `Your overdue amount is ${row.overdueAmount.toString()} ${row.currency}; total remaining balance is ${row.balance.toString()} ${row.currency}. Please contact the finance office.`,
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
