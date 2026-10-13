import { describe,expect,it } from "vitest";
import type { ApplicationStatus } from "../../generated/prisma/client.js";
import {
assertTransition,
canTransition,
groupWaitlist,
nextStatuses,
rankWaitlist,
requiresReason,
seatsLeft,
transitionOptions,
} from "./application-policy.js";

const ALL: ApplicationStatus[] = ["NEW", "REVIEWING", "ACCEPTED", "WAITLISTED", "REJECTED", "ENROLLED", "WITHDRAWN"];

describe("application status transitions", () => {
  it("follows the admissions pipeline", () => {
    expect(nextStatuses("NEW")).toEqual(["REVIEWING", "WITHDRAWN"]);
    expect(nextStatuses("REVIEWING")).toEqual(["ACCEPTED", "WAITLISTED", "REJECTED", "WITHDRAWN"]);
    expect(nextStatuses("WAITLISTED")).toEqual(["ACCEPTED", "WITHDRAWN"]);
    expect(nextStatuses("ACCEPTED")).toEqual(["ENROLLED", "WITHDRAWN"]);
  });

  it("treats rejected, enrolled and withdrawn as final", () => {
    for (const final of ["REJECTED", "ENROLLED", "WITHDRAWN"] as ApplicationStatus[]) {
      for (const to of ALL) expect(canTransition(final, to)).toBe(false);
    }
  });

  it("never skips review or jumps straight to enrolled", () => {
    expect(canTransition("NEW", "ACCEPTED")).toBe(false);
    expect(canTransition("NEW", "REJECTED")).toBe(false);
    expect(canTransition("REVIEWING", "ENROLLED")).toBe(false);
    expect(canTransition("WAITLISTED", "REJECTED")).toBe(false);
    expect(() => assertTransition("NEW", "ACCEPTED", { studentLinked: false })).toThrow(/cannot move from NEW to ACCEPTED/);
  });

  it("rejects a no-op change", () => {
    expect(() => assertTransition("REVIEWING", "REVIEWING", { studentLinked: false })).toThrow(/already reviewing/);
  });

  it("requires a linked student before enrolment", () => {
    expect(() => assertTransition("ACCEPTED", "ENROLLED", { studentLinked: false })).toThrow(/student account/);
    expect(() => assertTransition("ACCEPTED", "ENROLLED", { studentLinked: true })).not.toThrow();
  });

  it("requires a reason for waitlist, rejection and withdrawal only", () => {
    expect(requiresReason("WAITLISTED")).toBe(true);
    expect(requiresReason("REJECTED")).toBe(true);
    expect(requiresReason("WITHDRAWN")).toBe(true);
    expect(requiresReason("ACCEPTED")).toBe(false);
    expect(() => assertTransition("REVIEWING", "REJECTED", { studentLinked: false, reason: "  " })).toThrow(/reason/);
    expect(() => assertTransition("REVIEWING", "REJECTED", { studentLinked: false, reason: "Level full" })).not.toThrow();
    expect(() => assertTransition("REVIEWING", "WAITLISTED", { studentLinked: false, courseChosen: true, reason: "Full" })).not.toThrow();
    expect(() => assertTransition("NEW", "REVIEWING", { studentLinked: false })).not.toThrow();
  });

  it("only waitlists applications with a level and intake", () => {
    expect(() => assertTransition("REVIEWING", "WAITLISTED", { studentLinked: false, courseChosen: false, reason: "Full" })).toThrow(/level and intake/);
  });

  it("exposes the reason rule with each option", () => {
    expect(transitionOptions("WAITLISTED")).toEqual([
      { status: "ACCEPTED", reasonRequired: false },
      { status: "WITHDRAWN", reasonRequired: true },
    ]);
  });
});

const row = (id: string, waitlistedAt: string | null, createdAt: string, levelId = "A1", intakeId = "I1") => ({
  id, reference: `APP-2026-${id}`, levelId, intakeId,
  waitlistedAt: waitlistedAt ? new Date(waitlistedAt) : null, createdAt: new Date(createdAt),
});

describe("waitlist ordering", () => {
  it("ranks by waitlisted time, then application time, then reference", () => {
    const ranked = rankWaitlist([
      row("0003", "2026-10-03T08:00:00Z", "2026-09-01T08:00:00Z"),
      row("0001", "2026-10-01T08:00:00Z", "2026-09-20T08:00:00Z"),
      row("0004", "2026-10-01T08:00:00Z", "2026-09-10T08:00:00Z"),
      row("0002", "2026-10-01T08:00:00Z", "2026-09-10T08:00:00Z"),
    ]);
    expect(ranked.map((entry) => [entry.id, entry.position])).toEqual([["0002", 1], ["0004", 2], ["0001", 3], ["0003", 4]]);
  });

  it("falls back to the application date when waitlistedAt is missing", () => {
    const ranked = rankWaitlist([row("0002", null, "2026-10-05T08:00:00Z"), row("0001", "2026-10-06T08:00:00Z", "2026-09-01T08:00:00Z")]);
    expect(ranked.map((entry) => entry.id)).toEqual(["0002", "0001"]);
  });

  it("keeps a separate queue per level and intake", () => {
    const groups = groupWaitlist([
      row("0001", "2026-10-02T00:00:00Z", "2026-09-01T00:00:00Z", "A1", "I1"),
      row("0002", "2026-10-01T00:00:00Z", "2026-09-01T00:00:00Z", "B1", "I1"),
      row("0003", "2026-10-01T00:00:00Z", "2026-09-01T00:00:00Z", "A1", "I1"),
      row("0004", "2026-10-01T00:00:00Z", "2026-09-01T00:00:00Z", "A1", "I2"),
    ]);
    expect(groups.map((group) => group.key)).toEqual(["A1|I1", "B1|I1", "A1|I2"]);
    expect(groups[0]?.entries.map((entry) => [entry.id, entry.position])).toEqual([["0003", 1], ["0001", 2]]);
    expect(groups[1]?.entries[0]?.position).toBe(1);
  });

  it("reports seats left from capacity, unknown without classes", () => {
    expect(seatsLeft(30, 12)).toBe(18);
    expect(seatsLeft(20, 25)).toBe(0);
    expect(seatsLeft(0, 3)).toBeNull();
  });
});
