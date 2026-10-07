import type { IntakeItem } from '../../lib/services';
import type { IntakeDraft,IntakePhase,PhaseFields } from './types';

const pad = (value: number) => String(value).padStart(2, '0');

/** ISO → `yyyy-mm-dd` in **local** time, so a date never slips a day in UTC+2. */
export function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `yyyy-mm-dd` → ISO at local midnight, matching how the date was read back. */
export function toIsoDate(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

export function emptyDraft(): IntakeDraft {
  return {
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    enrollmentOpensAt: '',
    enrollmentEndsAt: '',
    registrationFee: '',
    bookFee: '',
    currency: 'RWF',
    isActive: true,
  };
}

export function toDraft(intake: IntakeItem): IntakeDraft {
  return {
    code: intake.code,
    name: intake.name,
    startDate: toDateInput(intake.startDate),
    endDate: toDateInput(intake.endDate),
    enrollmentOpensAt: toDateInput(intake.enrollmentOpensAt),
    enrollmentEndsAt: toDateInput(intake.enrollmentEndsAt),
    registrationFee: String(Number(intake.registrationFee)),
    bookFee: String(Number(intake.bookFee)),
    currency: intake.currency,
    isActive: intake.isActive,
  };
}

/**
 * The code is derived, never typed: `INTAKE-YYYY-MM` from the start month, which
 * is the convention the seed data already uses (`INTAKE-2026-09`).
 */
export function codeFromStart(startDate: string): string {
  if (!startDate) return '';
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `INTAKE-${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Name suggestion shown until the admin types their own. */
export function nameFromStart(startDate: string): string {
  if (!startDate) return '';
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `Intake ${date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
}

/**
 * On create, picking a start date regenerates the code and suggests a name. On
 * edit the code is left alone — it already identifies the cohort everywhere.
 */
export function withStartDate(
  draft: IntakeDraft,
  startDate: string,
  isCreate: boolean,
): IntakeDraft {
  if (!isCreate) return { ...draft, startDate };
  return {
    ...draft,
    startDate,
    code: codeFromStart(startDate),
    name: draft.name.trim() ? draft.name : nameFromStart(startDate),
  };
}

/** The four lifecycle phases, derived from the dates. `now` is injectable for tests. */
export function intakePhase(
  intake: PhaseFields,
  now: Date = new Date(),
): IntakePhase {
  const time = now.getTime();
  const start = new Date(intake.startDate).getTime();
  const end = new Date(intake.endDate).getTime();
  if (time < start) return 'Upcoming';
  if (time > end) return 'Ended';
  const opens = intake.enrollmentOpensAt ? new Date(intake.enrollmentOpensAt).getTime() : null;
  const closes = intake.enrollmentEndsAt ? new Date(intake.enrollmentEndsAt).getTime() : null;
  if (opens !== null && closes !== null && time >= opens && time <= closes) return 'Enrolling';
  return 'Running';
}

/** Percentage position of a window on the shared timeline, clamped to 0–100. */
export function windowSpan(
  from: string | null | undefined,
  to: string | null | undefined,
  origin: number,
  size: number,
): { left: number; width: number } | null {
  if (!from || !to || size <= 0) return null;
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const left = ((Math.max(start, origin) - origin) / size) * 100;
  const right = ((Math.min(end, origin + size) - origin) / size) * 100;
  return { left, width: Math.max(right - left, 2) };
}

export type TimelineScale = { origin: number; size: number; today: number | null };

/** One scale for the course and enrolment rails so the two bars line up. */
export function timelineScale(intake: PhaseFields, now: Date = new Date()): TimelineScale {
  const stamps = [new Date(intake.startDate).getTime(), new Date(intake.endDate).getTime()];
  for (const value of [intake.enrollmentOpensAt, intake.enrollmentEndsAt]) {
    if (value) stamps.push(new Date(value).getTime());
  }
  const origin = Math.min(...stamps);
  const size = Math.max(Math.max(...stamps) - origin, 1);
  const now_ = now.getTime();
  return { origin, size, today: now_ >= origin && now_ <= origin + size ? now_ : null };
}
