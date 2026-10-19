import { describe, expect, it } from "vitest";
import { claimProblem, settleProblem } from "./claim-rules.js";

const momo = { code: "MTN_MOMO", isActive: true, requiresReference: true };
const now = new Date("2026-10-17T12:00:00Z");

describe("claimProblem", () => {
  it("accepts a referenced payment from last week", () => {
    expect(claimProblem({ paidAt: new Date("2026-10-10"), reference: "MP123" }, momo, 0, now)).toBeNull();
  });
  it("rejects gateway, missing reference, future dates and spam", () => {
    expect(claimProblem({ paidAt: now }, { ...momo, code: "PAYPACK" }, 0, now)).toMatch(/Pay now/);
    expect(claimProblem({ paidAt: now, reference: " " }, momo, 0, now)).toMatch(/reference/);
    expect(claimProblem({ paidAt: new Date("2026-10-20"), reference: "x" }, momo, 0, now)).toMatch(/future/);
    expect(claimProblem({ paidAt: now, reference: "x" }, momo, 5, now)).toMatch(/waiting/);
    expect(claimProblem({ paidAt: now, reference: "x" }, null, 0, now)).toMatch(/active/);
  });
});

describe("settleProblem", () => {
  it("only settles the balance the officer saw", () => {
    expect(settleProblem(45000, 45000)).toBeNull();
    expect(settleProblem(0, 0)).toMatch(/nothing left/);
    expect(settleProblem(30000, 45000)).toMatch(/changed to 30000/);
  });
});
