import type { Role } from "../generated/prisma/client.js";

// Academic and finance administration have separate permissions.
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

/** Finance officers and system owners may manage money. */
export const FINANCE_ROLES: Role[] = ["FINANCE_ADMIN", "SUPER_ADMIN"];
