import { format } from 'date-fns';
import type { ApplicationRow,CatalogIntake } from '../../lib/admissions-types';
import { currencyAmount } from '../../lib/format';
import type { Money } from '../../lib/services/money';
import { money } from '../../lib/services/money';

export const fullName = (row: { firstName: string; lastName: string }): string => `${row.firstName} ${row.lastName}`;

export function shortDate(iso: string | null | undefined): string {
  return iso ? format(new Date(iso), 'd MMM yyyy') : '—';
}

export function dateTime(iso: string): string {
  return format(new Date(iso), 'd MMM yyyy, HH:mm');
}

export const fee = (amount: Money, currency: string): string => currencyAmount(money(amount), currency);

/** What the applicant asked for; website entries fall back to their free-text course. */
export function courseLabel(row: Pick<ApplicationRow, 'level' | 'intake' | 'rawPayload'>): string {
  if (row.level) return [row.level.code, row.intake?.name].filter(Boolean).join(' · ');
  const course = row.rawPayload?.course;
  return typeof course === 'string' && course ? `“${course}” (not matched)` : 'Course not set';
}

/** Seats still free for a level across campuses; null when no class capacity is published. */
export function seatsForLevel(intake: CatalogIntake, levelId: string): number | null {
  const rows = intake.seats.filter((row) => row.levelId === levelId && row.seatsLeft !== null);
  return rows.length ? rows.reduce((sum, row) => sum + (row.seatsLeft ?? 0), 0) : null;
}

export function seatsHint(seats: number | null): string | null {
  if (seats === null) return null;
  if (seats === 0) return 'Full — join the waitlist';
  return seats <= 5 ? `Only ${seats} seat${seats === 1 ? '' : 's'} left` : `${seats} seats left`;
}

export const applyLink = (levelId?: string, intakeId?: string): string => {
  const params = new URLSearchParams();
  if (levelId) params.set('level', levelId);
  if (intakeId) params.set('intake', intakeId);
  const text = params.toString();
  return text ? `/apply?${text}` : '/apply';
};
