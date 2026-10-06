import type { Role } from "../generated/prisma/client.js";

// Role groups used by route guards. Least privilege: finance never gets academic rights.
// The reverse is deliberately NOT the rule — academic admins also manage money (see
// FINANCE_ROLES). Role *assignment* stays super-admin-only (`users.service.ts`).
export const ALL_ROLES: Role[] = [
  "STUDENT",
  "TEACHER",
  "ACADEMIC_ADMIN",
  "FINANCE_ADMIN",
  "SUPER_ADMIN",
];

export const STAFF_ROLES: Role[] = ["TEACHER", "ACADEMIC_ADMIN", "FINANCE_ADMIN", "SUPER_ADMIN"];

/** Roles that may create/edit curriculum and grade academic work. */
export const ACADEMIC_ROLES: Role[] = ["TEACHER", "ACADEMIC_ADMIN", "SUPER_ADMIN"];

/** Roles that manage students, classes, intakes, campuses. */
export const ADMIN_ROLES: Role[] = ["ACADEMIC_ADMIN", "SUPER_ADMIN"];

/**
 * Roles that may touch money. An academic admin is included because the school runs
 * tuition collection out of the office: they own enrolments, which create the tuition
 * charge, so they need the finance module to reconcile it. `FINANCE_ADMIN` is the
 * role for a dedicated finance officer and has no academic rights.
 */
export const FINANCE_ROLES: Role[] = ["FINANCE_ADMIN", "ACADEMIC_ADMIN", "SUPER_ADMIN"];
