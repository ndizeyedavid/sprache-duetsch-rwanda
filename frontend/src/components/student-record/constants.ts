/**
 * Record tabs live in the URL (`?tab=`) so a link can open one directly.
 * `academic` tabs need Academic/Super Admin, `finance` needs Finance/Super Admin —
 * the same split the API enforces, so a tab never renders a 403.
 */
export const RECORD_TABS = [
  { key: 'overview', label: 'Overview', access: 'any' },
  { key: 'learning', label: 'Courses & progress', access: 'academic' },
  { key: 'assessments', label: 'Assessments', access: 'academic' },
  { key: 'attendance', label: 'Attendance', access: 'academic' },
  { key: 'certificates', label: 'Certificates', access: 'academic' },
  { key: 'payments', label: 'Payments', access: 'finance' },
] as const;

export type RecordTab = (typeof RECORD_TABS)[number]['key'];

export type RecordAccess = { academic: boolean; finance: boolean };

export const DEFAULT_TAB: RecordTab = 'overview';
