import { formatDistanceToNowStrict } from 'date-fns';
import type { ClassGroupItem,EnrollmentRow } from '../../lib/services';
import { EMPTY_FILTERS } from './constants';
import type { EnrolmentFilters,RegisterStats } from './types';

export function enrolFullName(row: EnrollmentRow): string {
  return `${row.student.user.firstName} ${row.student.user.lastName}`.trim();
}

/** One lowercase haystack per row so filtering stays a single pass. */
function searchHaystack(row: EnrollmentRow): string {
  return [
    enrolFullName(row),
    row.student.studentCode,
    row.student.user.email,
    row.student.user.phone ?? '',
    row.level.code,
    row.intake.name,
    row.campus?.name ?? '',
    row.classGroup?.name ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function hasActiveFilters(filters: EnrolmentFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.levelId !== '' ||
    filters.intakeId !== '' ||
    filters.status !== '' ||
    filters.classGroupId !== '' ||
    filters.campusId !== '' ||
    filters.awaitingOnly ||
    filters.access !== '' ||
    filters.activity !== ''
  );
}

export function filterEnrolments(rows: EnrollmentRow[], filters: EnrolmentFilters): EnrollmentRow[] {
  const needle = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle && !searchHaystack(row).includes(needle)) return false;
    if (filters.levelId && row.level.id !== filters.levelId) return false;
    if (filters.intakeId && row.intake.id !== filters.intakeId) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.classGroupId && row.classGroup?.id !== filters.classGroupId) return false;
    if (filters.campusId && row.campus?.id !== filters.campusId) return false;
    if (filters.awaitingOnly && (row.status !== 'ACTIVE' || row.classGroup)) return false;
    if (filters.access && row.access !== filters.access) return false;
    if (filters.activity === 'NEVER_SIGNED_IN' && row.lastLoginAt) return false;
    if (filters.activity === 'NO_LESSONS' && (row.progress?.lessonsDone ?? 0) > 0) return false;
    return true;
  });
}

export function registerStats(rows: EnrollmentRow[]): RegisterStats {
  const active = rows.filter((row) => row.status === 'ACTIVE');
  return {
    total: rows.length,
    active: active.length,
    awaitingClass: active.filter((row) => !row.classGroup).length,
    closed: rows.filter((row) => row.status === 'COMPLETED' || row.status === 'WITHDRAWN').length,
    unpaid: active.filter((row) => row.access === 'UNPAID').length,
    neverSignedIn: active.filter((row) => !row.lastLoginAt).length,
  };
}

/** Class groups only make sense inside the chosen level + intake. */
export function classOptionsFor(
  groups: ClassGroupItem[],
  levelId: string,
  intakeId: string,
): ClassGroupItem[] {
  return groups
    .filter((group) => group.isActive)
    .filter((group) => !levelId || group.levelId === levelId)
    .filter((group) => !intakeId || group.intakeId === intakeId);
}

/** Code and teacher tell apart classes that share a name ("A1" three times in one intake). */
export function classOptionLabel(group: ClassGroupItem): string {
  const teacher = group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : 'no teacher yet';
  const seats = group.capacity ? `${group._count.enrollments}/${group.capacity}` : `${group._count.enrollments} enrolled`;
  return `${group.name} (${group.code}) · ${group.shift.toLowerCase()} · ${teacher} · ${seats}`;
}

/** The API rejects the same student + level + intake twice, so catch it before submitting. */
export function duplicateEnrolment(
  rows: EnrollmentRow[],
  draft: { studentId: string; levelId: string; intakeId: string },
): EnrollmentRow | null {
  if (!draft.studentId || !draft.levelId || !draft.intakeId) return null;
  return (
    rows.find(
      (row) =>
        row.student.id === draft.studentId &&
        row.level.id === draft.levelId &&
        row.intake.id === draft.intakeId,
    ) ?? null
  );
}

/** Tuition override: blank keeps the level default, so only send a number. */
export function parseFee(value: string): { fee: number | undefined; error: string | null } {
  const raw = value.trim();
  if (!raw) return { fee: undefined, error: null };
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) {
    return { fee: undefined, error: 'Enter a valid amount, for example 45000.' };
  }
  return { fee: amount, error: null };
}

export function resetFilters(): EnrolmentFilters {
  return { ...EMPTY_FILTERS };
}
/** "When did they last sign in" in words; never-signed-in students stand out. */
export function lastSeen(iso: string | null | undefined): string {
  return iso ? `${formatDistanceToNowStrict(new Date(iso))} ago` : 'Never signed in';
}

/** Campuses that appear in the register, for the campus filter. */
export function registerCampuses(rows: EnrollmentRow[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const row of rows) if (row.campus) seen.set(row.campus.id, row.campus.name);
  return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}
