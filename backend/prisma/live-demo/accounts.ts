import type { AccountStatus, EnrollmentStatus, Role, Shift } from "../../src/generated/prisma/client.js";

/** Every demo record hangs off this email domain or the DEMO- code prefix, so reset can find it all. */
export const DEMO_DOMAIN = "demo.sparch.rw";
export const DEMO_PASSWORD = "Demo2026!";
export const DEMO_INTAKE = "INTAKE-2026-09";

export type DemoStaff = { key: string; email: string; firstName: string; lastName: string; role: Role };

export const demoStaff: DemoStaff[] = [
  { key: "academic", email: `academic@${DEMO_DOMAIN}`, firstName: "Aline", lastName: "Demo (Academic)", role: "ACADEMIC_ADMIN" },
  { key: "finance", email: `finance@${DEMO_DOMAIN}`, firstName: "David", lastName: "Demo (Finance)", role: "FINANCE_ADMIN" },
  { key: "teacherA1", email: `teacher@${DEMO_DOMAIN}`, firstName: "Clarisse", lastName: "Demo (Teacher A1)", role: "TEACHER" },
  { key: "teacherB1", email: `teacher.b1@${DEMO_DOMAIN}`, firstName: "Eric", lastName: "Demo (Teacher B1)", role: "TEACHER" },
];

export type FinanceCase = {
  fee: number;
  payments: { amount: number; method: string; daysAgo: number }[];
  refund?: number;
  discountPercent?: number;
  dueInDays: number;
};

export type DemoStudent = {
  key: string; code: string; email: string; firstName: string; lastName: string; phone: string;
  level: "A1" | "B1"; campus: "NORRSKEN" | "KACYIRU"; shift: Shift; status: AccountStatus;
  enrollment: EnrollmentStatus | null; inClass: boolean; finance: FinanceCase;
  /** Share of past sessions attended, drives attendance + at-risk lists. */
  attendance: number; lessonsDone: number;
};

const s = (key: string, n: number, first: string, last: string, rest: Omit<DemoStudent, "key" | "code" | "email" | "firstName" | "lastName" | "phone">): DemoStudent => ({
  key, code: `DEMO-${String(n).padStart(4, "0")}`, email: `${key}@${DEMO_DOMAIN}`, firstName: first, lastName: last,
  phone: `+250 780 000 ${String(100 + n)}`, ...rest,
});

const A1 = { level: "A1", campus: "NORRSKEN", shift: "EVENING", inClass: true } as const;

export const demoStudents: DemoStudent[] = [
  s("student", 1, "Nella", "Ishimwe", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 0.85, lessonsDone: 9,
    finance: { fee: 45000, payments: [{ amount: 20000, method: "MOMO", daysAgo: 30 }, { amount: 25000, method: "AIRTEL", daysAgo: 6 }], dueInDays: 14 } }),
  s("paid", 2, "Jean", "Mugisha", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 1, lessonsDone: 14,
    finance: { fee: 45000, payments: [{ amount: 45000, method: "MOMO", daysAgo: 35 }], dueInDays: -5 } }),
  s("unpaid", 3, "Diane", "Umutoni", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 0.7, lessonsDone: 3,
    finance: { fee: 45000, payments: [], dueInDays: 14 } }),
  s("overdue", 4, "Patrick", "Nkurunziza", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 0.3, lessonsDone: 1,
    finance: { fee: 45000, payments: [{ amount: 5000, method: "CASH", daysAgo: 40 }], dueInDays: -12 } }),
  s("waived", 5, "Grace", "Uwera", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 0.9, lessonsDone: 6,
    finance: { fee: 45000, payments: [], discountPercent: 100, dueInDays: 10 } }),
  s("b1", 6, "Samuel", "Habimana", { level: "B1", campus: "KACYIRU", shift: "MORNING", inClass: true, status: "ACTIVE", enrollment: "ACTIVE",
    attendance: 0.8, lessonsDone: 4, finance: { fee: 60000, payments: [{ amount: 30000, method: "AIRTEL", daysAgo: 45 }, { amount: 30000, method: "BANK", daysAgo: 10 }], dueInDays: 20 } }),
  s("graduate", 7, "Ange", "Mutesi", { ...A1, inClass: false, status: "GRADUATED", enrollment: "COMPLETED", attendance: 1, lessonsDone: 99,
    finance: { fee: 45000, payments: [{ amount: 45000, method: "BANK", daysAgo: 120 }], dueInDays: -90 } }),
  s("pending", 8, "Kevin", "Iradukunda", { ...A1, inClass: false, status: "PENDING", enrollment: null, attendance: 0, lessonsDone: 0,
    finance: { fee: 0, payments: [], dueInDays: 0 } }),
  s("refunded", 9, "Alice", "Ingabire", { ...A1, inClass: false, status: "WITHDRAWN", enrollment: "WITHDRAWN", attendance: 0.2, lessonsDone: 1,
    finance: { fee: 45000, payments: [{ amount: 45000, method: "MOMO", daysAgo: 50 }], refund: 45000, dueInDays: 30 } }),
  s("suspended", 10, "Olivier", "Ndayisaba", { ...A1, status: "SUSPENDED", enrollment: "ACTIVE", attendance: 0.4, lessonsDone: 2,
    finance: { fee: 45000, payments: [], dueInDays: -30 } }),
  s("partial", 11, "Yvonne", "Uwamahoro", { ...A1, status: "ACTIVE", enrollment: "ACTIVE", attendance: 0.75, lessonsDone: 2,
    finance: { fee: 45000, payments: [{ amount: 20000, method: "MOMO", daysAgo: 25 }], dueInDays: 14 } }),
];
