import type { AuthRole } from './auth-store';

// Role groups mirror the backend (`src/lib/roles.ts`) so the UI never offers an
// action the API will reject with 403.
export const STUDENT_ROLES: AuthRole[] = ['STUDENT'];
export const TEACHER_ROLES: AuthRole[] = ['TEACHER'];
export const ACADEMIC_ROLES: AuthRole[] = ['TEACHER', 'ACADEMIC_ADMIN', 'SUPER_ADMIN'];
export const ADMIN_ROLES: AuthRole[] = ['ACADEMIC_ADMIN', 'SUPER_ADMIN'];
export const FINANCE_ROLES: AuthRole[] = ['FINANCE_ADMIN', 'SUPER_ADMIN'];
export const STAFF_ROLES: AuthRole[] = ['TEACHER', 'ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'];

/** Where each role lands after signing in. */
export const homePath: Record<AuthRole, string> = {
  STUDENT: '/dashboard',
  TEACHER: '/teacher',
  ACADEMIC_ADMIN: '/admin',
  FINANCE_ADMIN: '/admin/finance',
  SUPER_ADMIN: '/admin',
};

export const roleLabel: Record<AuthRole, string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ACADEMIC_ADMIN: 'Academic Admin',
  FINANCE_ADMIN: 'Finance Admin',
  SUPER_ADMIN: 'Super Admin',
};

export type Portal = 'student' | 'teacher' | 'staff';

/** Roles allowed through each login portal. */
export const portalRoles: Record<Portal, AuthRole[]> = {
  student: ['STUDENT'],
  teacher: ['TEACHER'],
  staff: ['ACADEMIC_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'],
};

export const portalLoginPath: Record<Portal, string> = {
  student: '/login',
  teacher: '/login/teacher',
  staff: '/login/staff',
};

export const portalLabel: Record<Portal, string> = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
};

export function isAcademic(role: AuthRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

export function isFinance(role: AuthRole): boolean {
  return FINANCE_ROLES.includes(role);
}

export function isAdmin(role: AuthRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canAccess(role: AuthRole, allowed: AuthRole[]): boolean {
  return allowed.includes(role);
}
