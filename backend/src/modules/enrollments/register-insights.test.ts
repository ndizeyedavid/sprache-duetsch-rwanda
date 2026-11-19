import { describe,expect,it } from "vitest";
import { courseAccess,progressCounts,progressKey } from "./register-insights.js";

describe("enrolment register insights", () => {
  it("opens the course only for a live, paid enrolment on an unblocked account", () => {
    expect(courseAccess({ enrollmentStatus: "ACTIVE", accountStatuses: ["ACTIVE", "PENDING"], paid: true })).toBe("OPEN");
    expect(courseAccess({ enrollmentStatus: "ACTIVE", accountStatuses: ["PENDING", "PENDING"], paid: false })).toBe("UNPAID");
    expect(courseAccess({ enrollmentStatus: "COMPLETED", accountStatuses: ["ACTIVE", "ACTIVE"], paid: true })).toBe("OPEN");
    expect(courseAccess({ enrollmentStatus: "ACTIVE", accountStatuses: ["ACTIVE", "SUSPENDED"], paid: true })).toBe("SUSPENDED");
    expect(courseAccess({ enrollmentStatus: "WITHDRAWN", accountStatuses: ["ACTIVE", "ACTIVE"], paid: true })).toBe("CLOSED");
    expect(courseAccess({ enrollmentStatus: "DEFERRED", accountStatuses: ["SUSPENDED", "ACTIVE"], paid: false })).toBe("CLOSED");
  });

  it("counts completed lessons per student and level", () => {
    const counts = progressCounts([{ studentId: "s1", levelId: "a1" }, { studentId: "s1", levelId: "a1" }, { studentId: "s1", levelId: "a2" }, { studentId: "s2", levelId: "a1" }]);
    expect(counts.get(progressKey("s1", "a1"))).toBe(2);
    expect(counts.get(progressKey("s1", "a2"))).toBe(1);
    expect(counts.get(progressKey("s3", "a1"))).toBeUndefined();
  });
});
