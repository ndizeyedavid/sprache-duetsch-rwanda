import type { Role } from "../generated/prisma/client.js";

// Role groups used by route guards. Least privilege: finance never gets academic rights.
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

/** Roles that may touch money. */
export const FINANCE_ROLES: Role[] = ["FINANCE_ADMIN", "SUPER_ADMIN"];
