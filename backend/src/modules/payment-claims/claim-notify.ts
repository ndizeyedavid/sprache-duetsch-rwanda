import type { PaymentClaim } from "../../generated/prisma/client.js";
import { notifyUser,notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { FINANCE_ROLES } from "../../lib/roles.js";

const money = (claim: Pick<PaymentClaim, "amount" | "currency">) => `${claim.currency} ${Number(claim.amount).toLocaleString("en-US")}`;

type SubmittedClaim = PaymentClaim & { method: { name: string }; student: { studentCode: string; user: { firstName: string; lastName: string } } };

/** Every active finance officer (and super admin) hears about a new report straight away. */
export async function notifyFinanceOfClaim(claim: SubmittedClaim) {
  const staff = await prisma.user.findMany({ where: { role: { in: FINANCE_ROLES }, status: "ACTIVE" }, select: { id: true } });
  const who = `${claim.student.user.firstName} ${claim.student.user.lastName} (${claim.student.studentCode})`;
  await notifyUsers(staff.map((user) => user.id), {
    type: "PAYMENT", channel: "IN_APP", eventKey: `payment-claim:${claim.id}`,
    title: "Payment waiting for approval",
    body: `${who} reported ${money(claim)} by ${claim.method.name}${claim.reference ? ` (ref ${claim.reference})` : ""}.`,
    data: { claimId: claim.id, link: "/admin/transactions?tab=approvals" },
  });
}

/** Tell the student the outcome; approvals include the receipt number. */
export async function notifyStudentOfReview(userId: string, outcome: "APPROVED" | "REJECTED", claim: PaymentClaim, receiptNumber?: string) {
  await notifyUser(userId, outcome === "APPROVED" ? {
    type: "PAYMENT", title: "Payment confirmed",
    body: `Finance confirmed your payment of ${money(claim)}${receiptNumber ? ` — receipt ${receiptNumber}` : ""}. Your balance is updated.`,
    data: { claimId: claim.id, link: "/payments" },
  } : {
    type: "PAYMENT", title: "Payment could not be confirmed",
    body: `Finance could not confirm your payment of ${money(claim)}: ${claim.reviewNote ?? "no reason given"}. Check the reference and report it again.`,
    data: { claimId: claim.id, link: "/payments" },
  });
}
