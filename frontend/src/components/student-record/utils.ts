import { differenceInYears,format,parseISO } from 'date-fns';
import { humanize } from '../../lib/services/humanize';
import type { StudentDetail } from '../../lib/services/student-detail';
import type { RecordAccess,RecordTab } from './constants';
import { DEFAULT_TAB,RECORD_TABS } from './constants';

export type DetailRow = { label: string; value: string; href?: string };

export function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

export function shortDate(value: string | null | undefined): string {
  return value ? format(parseISO(value), 'd MMM yyyy') : '—';
}

export function dateTime(value: string | null | undefined): string {
  return value ? format(parseISO(value), 'd MMM yyyy · HH:mm') : '—';
}

export function visibleTabs(access: RecordAccess) {
  return RECORD_TABS.filter((tab) => tab.access === 'any' || access[tab.access]);
}

/** Unknown or forbidden `?tab=` values fall back to the overview. */
export function resolveTab(requested: string | null, access: RecordAccess): RecordTab {
  return visibleTabs(access).find((tab) => tab.key === requested)?.key ?? DEFAULT_TAB;
}

/** The enrolment that describes the student today: active first, then most recent. */
export function currentEnrolment(student: StudentDetail) {
  return student.enrollments.find((row) => row.status === 'ACTIVE') ?? student.enrollments[0] ?? null;
}

export function personalRows(student: StudentDetail): DetailRow[] {
  const { user } = student;
  const age = student.dateOfBirth ? ` (${differenceInYears(new Date(), parseISO(student.dateOfBirth))} yrs)` : '';
  return [
    { label: 'Email', value: user.email, href: `mailto:${user.email}` },
    { label: 'Phone', value: user.phone ?? '—', href: user.phone ? `tel:${user.phone}` : undefined },
    { label: 'Date of birth', value: student.dateOfBirth ? `${shortDate(student.dateOfBirth)}${age}` : '—' },
    { label: 'Gender', value: humanize(student.gender) },
    { label: 'National ID', value: student.nationalId ?? '—' },
    { label: 'Address', value: student.address ?? '—' },
  ];
}

export function guardianRows(student: StudentDetail): DetailRow[] {
  const phone = student.guardianPhone;
  return [
    { label: 'Guardian', value: student.guardianName ?? '—' },
    { label: 'Guardian phone', value: phone ?? '—', href: phone ? `tel:${phone}` : undefined },
  ];
}

export function academicRows(student: StudentDetail): DetailRow[] {
  const intended = student.intendedLevel;
  return [
    { label: 'Campus', value: student.campus?.name ?? '—' },
    { label: 'Intake', value: student.intake?.name ?? '—' },
    { label: 'Shift', value: humanize(student.shift) },
    { label: 'Intended level', value: intended ? `${intended.code} · ${intended.title}` : '—' },
    { label: 'Placement score', value: student.placementScore === null ? 'Not tested' : `${student.placementScore}%` },
    { label: 'Registered', value: shortDate(student.createdAt) },
  ];
}
