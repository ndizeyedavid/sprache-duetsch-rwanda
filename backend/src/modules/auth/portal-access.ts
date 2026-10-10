import type { Role } from '../../generated/prisma/client.js';

export type AuthPortal = 'student' | 'teacher' | 'staff';

export function portalAcceptsRole(portal: AuthPortal, role: Role): boolean {
  if (portal === 'student') return role === 'STUDENT';
  if (portal === 'teacher') return role === 'TEACHER';
  return role === 'ACADEMIC_ADMIN' || role === 'FINANCE_ADMIN' || role === 'SUPER_ADMIN';
}
