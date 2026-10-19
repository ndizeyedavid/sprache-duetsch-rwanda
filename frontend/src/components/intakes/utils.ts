import type { IntakeItem } from '../../lib/services';
import type { IntakeDraft,IntakePhase,PhaseFields,RegistrationFields,RegistrationFilter } from './types';

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
    registrationOpen: true,
  };
}

export function toDraft(intake: IntakeItem): IntakeDraft {
  return {
    code: intake.code,
    name: intake.name,
    startDate: toDateInput(intake.startDate),
    endDate: toDateInput(intake.endDate),
    registrationOpen: intake.registrationOpen,
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

/** Where the intake sits in time. `now` is injectable for tests. */
export function intakePhase(intake: PhaseFields, now: Date = new Date()): IntakePhase {
  const time = now.getTime();
  if (time < new Date(intake.startDate).getTime()) return 'Upcoming';
  if (time > new Date(intake.endDate).getTime()) return 'Ended';
  return 'Running';
}

/** Students can register only while the switch is on, the intake is live and has not ended. */
export function isRegistrationOpen(intake: RegistrationFields, now: Date = new Date()): boolean {
  return intake.isActive && intake.registrationOpen && new Date(intake.endDate).getTime() >= now.getTime();
}

export function matchesRegistration(intake: RegistrationFields, filter: RegistrationFilter): boolean {
  if (filter === 'All') return true;
  if (filter === 'Archived') return !intake.isActive;
  return intake.isActive && isRegistrationOpen(intake) === (filter === 'Open');
}

/** Percentage of the course already taught (0 before the start, 100 after the end). */
export function courseProgress(intake: PhaseFields, now: Date = new Date()): number {
  const start = new Date(intake.startDate).getTime();
  const end = new Date(intake.endDate).getTime();
  if (end <= start) return 0;
  return Math.round(Math.min(Math.max((now.getTime() - start) / (end - start), 0), 1) * 100);
}
