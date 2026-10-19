import type { Role } from "../../src/generated/prisma/client.js";
import { DEMO_DOMAIN } from "./accounts.js";

/** One account per platform role; these are the only accounts listed on /demo. */
export const quickTestAccounts: { key: string; email: string; firstName: string; role: Role }[] = [
  { key: "admin", email: `admin@${DEMO_DOMAIN}`, firstName: "Super Admin", role: "SUPER_ADMIN" },
  { key: "academic", email: `academic@${DEMO_DOMAIN}`, firstName: "Academic Admin", role: "ACADEMIC_ADMIN" },
  { key: "finance", email: `finance@${DEMO_DOMAIN}`, firstName: "Finance Admin", role: "FINANCE_ADMIN" },
  { key: "teacher", email: `teacher@${DEMO_DOMAIN}`, firstName: "Teacher", role: "TEACHER" },
  { key: "student", email: `student@${DEMO_DOMAIN}`, firstName: "Student", role: "STUDENT" },
];

export const QUICK_DEMO_CLASS = "DEMO-QUICK-A1";
export const QUICK_DEMO_STUDENT = "DEMO-QUICK-STUDENT";
export const QUICK_DEMO_LEVELS = ["A1", "A2", "B1", "B2"];
