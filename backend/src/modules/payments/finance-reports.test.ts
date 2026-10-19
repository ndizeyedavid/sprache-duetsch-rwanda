import { describe, expect, it, vi } from "vitest";
import { Prisma } from "../../generated/prisma/client.js";
import type { FinanceLedger } from "./finance-ledger.js";
import { computeFinance } from "./finance-reports.js";

vi.mock("../../lib/prisma.js", () => ({ prisma: {} }));

const now = new Date("2026-10-17T00:00:00Z");
const d = (value: number) => new Prisma.Decimal(value);
const intake = (id: string) => ({ id, name: id.toUpperCase() });
const enrollment = (intakeId: string) => ({ intakeId, campusId: "c1", levelId: "l1", intake: intake(intakeId), level: { id: "l1", title: "A1" }, campus: { id: "c1", name: "Kigali" } });
const student = (intakeId: string | null) => ({ intakeId, intake: intakeId ? intake(intakeId) : null });
const base = { currency: "RWF", createdAt: new Date("2026-01-01T00:00:00Z") };

// s1: enrolled in OLD (charge 100, overdue) and NEW (charge 300, not yet due); Student.intakeId = NEW.
// One un-linked payment of 50 falls back to s1's current intake (NEW).
const ledger = {
  charges: [
    { ...base, id: "c-old", studentId: "s1", amount: d(100), dueDate: new Date("2026-02-01T00:00:00Z"), enrollment: enrollment("old"), student: student("new") },
    { ...base, id: "c-new", studentId: "s1", amount: d(300), dueDate: new Date("2026-12-01T00:00:00Z"), enrollment: enrollment("new"), student: student("new") },
  ],
  payments: [{ ...base, id: "p1", studentId: "s1", amount: d(50), txnType: "PAYMENT", paidAt: base.createdAt, methodId: "m", method: { code: "CASH", name: "Cash" }, enrollment: null, student: student("new") }],
  discounts: [{ ...base, id: "d1", studentId: "s1", amount: d(20), approvedAt: base.createdAt, enrollment: enrollment("new"), student: student("new") }],
} as unknown as FinanceLedger;

describe("computeFinance intake attribution", () => {
  it("buckets rows by enrolment intake, falling back to the student's intake", () => {
    const { intakes } = computeFinance(ledger, {}, now);
    const totals = (key: string) => { const b = intakes.get(key); return b && [b.billed.toString(), b.collected.toString(), b.outstanding.toString()]; };
    expect(totals("old")).toEqual(["100", "0", "30"]);
    expect(totals("new")).toEqual(["280", "50", "300"]);
    expect(intakes.has("unassigned")).toBe(false);
  });

  it("allocates credit oldest-first over the whole ledger, then scopes outstanding + overdue", () => {
    // Credit 70 (50 paid + 20 discount) covers 70 of the older OLD charge.
    const old = computeFinance(ledger, { intakeId: "old" }, now);
    expect(old.summary.totalOutstanding.toString()).toBe("30");
    expect([...old.overdueStudentIds]).toEqual(["s1"]);
    const next = computeFinance(ledger, { intakeId: "new" }, now);
    expect(next.summary.totalOutstanding.toString()).toBe("300");
    expect(next.summary.totalCollected.toString()).toBe("50");
    expect(next.overdueStudentIds.size).toBe(0);
  });
});
