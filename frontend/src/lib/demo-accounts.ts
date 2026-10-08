import type { AuthRole } from './auth-store';
import { apiGet } from './api';

export type DemoAccount = { role: AuthRole; email: string; password: string };

/** Test accounts for the hosted demo. The endpoint returns 404 when they are switched off. */
export const listDemoAccounts = () => apiGet<DemoAccount[]>('/demo/accounts');

export const demoRoleSummary: Record<AuthRole, string> = {
  STUDENT: 'Courses, lessons, payments and certificates.',
  TEACHER: 'Classes, attendance, grading and course content.',
  ACADEMIC_ADMIN: 'Students, classes, enrolments, curriculum and certificates.',
  FINANCE_ADMIN: 'Fees, payments, discounts and receipts.',
  SUPER_ADMIN: 'Everything, including roles and password resets.',
};
