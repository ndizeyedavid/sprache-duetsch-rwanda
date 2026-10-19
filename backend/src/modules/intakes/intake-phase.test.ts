import { describe, expect, it } from "vitest";
import type { IntakeWindow } from "./intake-phase.js";
import { intakePhase,isEnrollmentOpen } from "./intake-phase.js";

const now = new Date("2026-10-17T12:00:00Z");
const day = (offset: number) => new Date(now.getTime() + offset * 86_400_000);
const intake = (patch: Partial<IntakeWindow> = {}): IntakeWindow => ({
  isActive: true, startDate: day(10), endDate: day(100), registrationOpen: true, ...patch,
});

describe("intakePhase", () => {
  it("archives inactive intakes whatever their dates", () => {
    expect(intakePhase(intake({ isActive: false }), now)).toBe("ARCHIVED");
    expect(intakePhase(intake({ isActive: false, startDate: day(-100), endDate: day(-10) }), now)).toBe("ARCHIVED");
  });

  it("is FINISHED once the end date has passed", () => {
    expect(intakePhase(intake({ startDate: day(-100), endDate: day(-1) }), now)).toBe("FINISHED");
  });

  it("is RUNNING from the start date until the end date, even if late enrolment is open", () => {
    expect(intakePhase(intake({ startDate: day(-1) }), now)).toBe("RUNNING");
    expect(intakePhase(intake({ startDate: now }), now)).toBe("RUNNING");
    expect(intakePhase(intake({ startDate: day(-5), endDate: now }), now)).toBe("RUNNING");
  });

  it("is ENROLLING before the start while registration is open", () => {
    expect(intakePhase(intake(), now)).toBe("ENROLLING");
  });

  it("is UPCOMING before the start when registration is closed", () => {
    expect(intakePhase(intake({ registrationOpen: false }), now)).toBe("UPCOMING");
  });
});

describe("isEnrollmentOpen", () => {
  it("is open while switched on and the intake has not ended", () => {
    expect(isEnrollmentOpen(intake(), now)).toBe(true);
    expect(isEnrollmentOpen(intake({ startDate: day(-5) }), now)).toBe(true);
    expect(isEnrollmentOpen(intake({ startDate: day(-50), endDate: day(-1) }), now)).toBe(false);
    expect(isEnrollmentOpen(intake({ registrationOpen: false }), now)).toBe(false);
    expect(isEnrollmentOpen(intake({ registrationOpen: false, startDate: day(-5) }), now)).toBe(false);
    expect(isEnrollmentOpen(intake({ isActive: false }), now)).toBe(false);
  });
});
