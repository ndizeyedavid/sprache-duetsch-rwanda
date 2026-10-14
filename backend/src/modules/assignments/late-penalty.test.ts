import { describe, expect, it } from "vitest";
import { applyLatePenalty, computeLateness, effectiveDueAt } from "./late-penalty.js";

const policy = { gracePeriodMinutes: 15, latePenaltyPercentPerDay: 10, latePenaltyMaxPercent: 30 };
const due = new Date("2026-03-28T22:00:00Z");
const after = (minutes: number) => new Date(due.getTime() + minutes * 60_000);

describe("late penalty", () => {
  it("treats work before the deadline or inside the grace period as on time", () => {
    expect(computeLateness({ submittedAt: after(-5), dueAt: due, policy })).toEqual({ isLate: false, lateByMinutes: null, penaltyPercent: 0 });
    expect(computeLateness({ submittedAt: due, dueAt: due, policy })).toEqual({ isLate: false, lateByMinutes: null, penaltyPercent: 0 });
    expect(computeLateness({ submittedAt: after(15), dueAt: due, policy })).toEqual({ isLate: false, lateByMinutes: 15, penaltyPercent: 0 });
    expect(computeLateness({ submittedAt: after(60), dueAt: null, policy }).isLate).toBe(false);
  });

  it("charges every started day counted from the deadline, up to the cap", () => {
    expect(computeLateness({ submittedAt: after(16), dueAt: due, policy })).toEqual({ isLate: true, lateByMinutes: 16, penaltyPercent: 10 });
    expect(computeLateness({ submittedAt: after(24 * 60), dueAt: due, policy }).penaltyPercent).toBe(10);
    expect(computeLateness({ submittedAt: after(24 * 60 + 1), dueAt: due, policy }).penaltyPercent).toBe(20);
    expect(computeLateness({ submittedAt: after(10 * 24 * 60), dueAt: due, policy }).penaltyPercent).toBe(30);
    expect(computeLateness({ submittedAt: new Date(due.getTime() + 1), dueAt: due, policy: { ...policy, gracePeriodMinutes: 0 } })).toEqual({ isLate: true, lateByMinutes: 1, penaltyPercent: 10 });
  });

  it("marks late work without a penalty when the policy has none, and accepts Decimal-like values", () => {
    const none = { gracePeriodMinutes: 0, latePenaltyPercentPerDay: "0", latePenaltyMaxPercent: "100" };
    expect(computeLateness({ submittedAt: after(90), dueAt: due, policy: none })).toEqual({ isLate: true, lateByMinutes: 90, penaltyPercent: 0 });
    expect(computeLateness({ submittedAt: after(30), dueAt: due, policy: { ...policy, latePenaltyPercentPerDay: "12.5", latePenaltyMaxPercent: "200" } }).penaltyPercent).toBe(12.5);
  });

  it("is time-zone safe: the same instants give the same result whatever offset they are written in", () => {
    // 2026-03-29 is a DST switch in Europe; a late day is still exactly 24 hours.
    const kigali = computeLateness({ submittedAt: new Date("2026-03-30T00:30:00+02:00"), dueAt: new Date("2026-03-29T00:00:00+02:00"), policy });
    const utc = computeLateness({ submittedAt: new Date("2026-03-29T22:30:00Z"), dueAt: new Date("2026-03-28T22:00:00Z"), policy });
    expect(kigali).toEqual(utc);
    expect(utc).toEqual({ isLate: true, lateByMinutes: 24 * 60 + 30, penaltyPercent: 20 });
  });

  it("uses a later per-student extension as the deadline, never an earlier one", () => {
    const extension = after(3 * 24 * 60);
    expect(effectiveDueAt(due, extension)).toEqual(extension);
    expect(effectiveDueAt(due, after(-60))).toEqual(due);
    expect(effectiveDueAt(null, extension)).toBeNull();
    expect(computeLateness({ submittedAt: after(2 * 24 * 60), dueAt: due, extensionDueAt: extension, policy })).toEqual({ isLate: false, lateByMinutes: null, penaltyPercent: 0 });
    expect(computeLateness({ submittedAt: after(3 * 24 * 60 + 20), dueAt: due, extensionDueAt: extension, policy })).toEqual({ isLate: true, lateByMinutes: 20, penaltyPercent: 10 });
  });

  it("applies the penalty to the teacher's score in exact hundredths", () => {
    expect(applyLatePenalty(10, 0)).toBe(10);
    expect(applyLatePenalty(7.5, 10)).toBe(6.75);
    expect(applyLatePenalty(8.33, 15)).toBe(7.08);
    expect(applyLatePenalty(9, 100)).toBe(0);
    expect(applyLatePenalty(9, 150)).toBe(0);
    expect(applyLatePenalty(0.1 + 0.2, 0)).toBe(0.3);
  });
});
