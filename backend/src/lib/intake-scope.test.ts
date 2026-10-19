import { describe, expect, it } from "vitest";
import type { Prisma } from "../generated/prisma/client.js";
import { andWhere,attendanceIntakeWhere,chargeIntakeWhere,paymentIntakeWhere,receiptIntakeWhere,resolveIntakeId,studentIntakeWhere } from "./intake-scope.js";

const linked = {
  OR: [
    { enrollment: { is: { intakeId: "i1" } } },
    { enrollmentId: null, student: { is: { intakeId: "i1" } } },
  ],
};

describe("resolveIntakeId", () => {
  it("prefers the enrolment intake", () => {
    expect(resolveIntakeId({ enrollment: { intakeId: "e" }, student: { intakeId: "s" } })).toBe("e");
  });

  it("falls back to the student's intake, then null", () => {
    expect(resolveIntakeId({ enrollment: null, student: { intakeId: "s" } })).toBe("s");
    expect(resolveIntakeId({ enrollment: null, student: { intakeId: null } })).toBeNull();
    expect(resolveIntakeId({})).toBeNull();
  });
});

describe("where-builders", () => {
  it("attribute ledger rows by enrolment, else by the student's intake", () => {
    expect(chargeIntakeWhere("i1")).toEqual(linked);
    expect(paymentIntakeWhere("i1")).toEqual(linked);
    expect(receiptIntakeWhere("i1")).toEqual({ payment: linked });
  });

  it("match students by any enrolment, or by Student.intakeId when they have none", () => {
    expect(studentIntakeWhere("i1")).toEqual({
      OR: [{ enrollments: { some: { intakeId: "i1" } } }, { intakeId: "i1", enrollments: { none: {} } }],
    });
  });

  it("scope attendance through the session's class group", () => {
    expect(attendanceIntakeWhere("i1")).toEqual({ session: { classGroup: { intakeId: "i1" } } });
  });
});

describe("andWhere", () => {
  it("leaves the filter untouched without an intake", () => {
    const where: Prisma.PaymentWhereInput = { studentId: "s" };
    expect(andWhere(where, undefined)).toEqual({ studentId: "s" });
    expect(andWhere(where, "")).toEqual({ studentId: "s" });
  });

  it("appends to AND without clobbering existing OR / AND clauses", () => {
    const search = [{ studentCode: { contains: "x" } }];
    const where: Prisma.StudentWhereInput = { OR: search, AND: { status: "ACTIVE" } };
    andWhere(where, studentIntakeWhere("i1"));
    expect(where).toEqual({ OR: search, AND: [{ status: "ACTIVE" }, studentIntakeWhere("i1")] });
  });
});
