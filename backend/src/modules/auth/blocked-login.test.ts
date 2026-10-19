import { describe,expect,it } from "vitest";
import { isLoginBlocked } from "./blocked_login_statuses.js";

describe("isLoginBlocked", () => {
  it("lets suspended students in (to read the reason) but no other suspended account", () => {
    expect(isLoginBlocked({ status: "SUSPENDED", role: "STUDENT" })).toBe(false);
    expect(isLoginBlocked({ status: "SUSPENDED", role: "TEACHER" })).toBe(true);
    expect(isLoginBlocked({ status: "SUSPENDED", role: "ACADEMIC_ADMIN" })).toBe(true);
  });

  it("always refuses withdrawn accounts and never active ones", () => {
    expect(isLoginBlocked({ status: "WITHDRAWN", role: "STUDENT" })).toBe(true);
    expect(isLoginBlocked({ status: "ACTIVE", role: "STUDENT" })).toBe(false);
    expect(isLoginBlocked({ status: "PENDING", role: "TEACHER" })).toBe(false);
  });
});
