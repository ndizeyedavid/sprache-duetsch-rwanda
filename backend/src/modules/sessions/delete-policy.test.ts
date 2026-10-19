import { describe, expect, it } from "vitest";
import { deleteProblem, shouldNotifyRemoval } from "./delete-policy.js";

const future = new Date(Date.now() + 86_400_000), past = new Date(Date.now() - 86_400_000);

describe("deleteProblem", () => {
  it("allows deleting a class with no history", () => {
    expect(deleteProblem({ status: "SCHEDULED", endAt: future, attendanceCount: 0 })).toBeNull();
    expect(deleteProblem({ status: "CANCELLED", endAt: past, attendanceCount: 0 })).toBeNull();
  });
  it("keeps classes with attendance, live classes and completed classes", () => {
    expect(deleteProblem({ status: "SCHEDULED", endAt: past, attendanceCount: 3 })).toMatch(/attendance records/);
    expect(deleteProblem({ status: "LIVE", endAt: future, attendanceCount: 0 })).toMatch(/live/);
    expect(deleteProblem({ status: "COMPLETED", endAt: past, attendanceCount: 0 })).toMatch(/Completed/);
  });
  it("notifies students only for classes they still expected", () => {
    expect(shouldNotifyRemoval({ status: "SCHEDULED", endAt: future })).toBe(true);
    expect(shouldNotifyRemoval({ status: "CANCELLED", endAt: future })).toBe(false);
    expect(shouldNotifyRemoval({ status: "SCHEDULED", endAt: past })).toBe(false);
  });
});
