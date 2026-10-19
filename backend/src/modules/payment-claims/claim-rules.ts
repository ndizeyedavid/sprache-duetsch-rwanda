// Pure checks for a student-reported payment, kept separate so they are unit-testable.

export const MAX_PENDING_CLAIMS = 5;
const MAX_AGE_DAYS = 366;

/** Methods only finance may use: the gateway confirms itself, scholarships are granted, not paid. */
const STAFF_ONLY = new Set(["PAYPACK", "SCHOLARSHIP"]);

export type ClaimMethod = { code: string; isActive: boolean; requiresReference: boolean };

export const studentCanReport = (code: string) => !STAFF_ONLY.has(code);

/** Returns why a claim can't be accepted, or null when it is fine. */
export function claimProblem(input: { paidAt: Date; reference?: string | null }, method: ClaimMethod | null, pending: number, now = new Date()): string | null {
  if (!method?.isActive) return "Choose an active payment method";
  if (method.code === "PAYPACK") return "Gateway payments confirm themselves — use Pay now instead";
  if (STAFF_ONLY.has(method.code)) return "This payment method is recorded by the finance office";
  if (method.requiresReference && !input.reference?.trim()) return "Add the transaction reference from your receipt or SMS";
  if (input.paidAt.getTime() > now.getTime() + 5 * 60_000) return "The payment date cannot be in the future";
  if (now.getTime() - input.paidAt.getTime() > MAX_AGE_DAYS * 86_400_000) return "Payments older than a year must be recorded by the finance office";
  if (pending >= MAX_PENDING_CLAIMS) return "You already have several payments waiting for approval — please wait for finance to review them";
  return null;
}

/** "Mark as paid" only settles the exact balance the officer looked at. */
export function settleProblem(balance: number, expected: number): string | null {
  if (balance <= 0) return "This student has nothing left to pay";
  if (Math.abs(balance - expected) > 0.005) return `The balance changed to ${balance}. Refresh and try again.`;
  return null;
}
