import { format } from 'date-fns';
import { money } from '../../lib/services/money';
import type { IntakeOverview,IntakePhase } from '../../lib/services/intake-overview';

export const PHASE_LABEL: Record<IntakePhase, string> = {
  UPCOMING: 'Upcoming',
  ENROLLING: 'Enrolling',
  RUNNING: 'Running',
  FINISHED: 'Ended',
  ARCHIVED: 'Archived',
};

/** Solid dot colour per phase (status labels reuse lib/status tones). */
export const PHASE_DOT: Record<IntakePhase, string> = {
  UPCOMING: 'bg-info',
  ENROLLING: 'bg-success',
  RUNNING: 'bg-warning',
  FINISHED: 'bg-base-300',
  ARCHIVED: 'bg-base-300',
};

export function dateRange(intake: Pick<IntakeOverview, 'startDate' | 'endDate'>): string {
  const start = new Date(intake.startDate);
  const end = new Date(intake.endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  return `${format(start, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
}

/** Share of billed money already collected, 0–100. */
export function collectedShare(finance: NonNullable<IntakeOverview['finance']>): number {
  const billed = money(finance.billed);
  return billed > 0 ? Math.min(100, Math.round((money(finance.collected) / billed) * 100)) : 0;
}

/** Live intakes first (running, enrolling, upcoming), then the rest by start date. */
const ORDER: IntakePhase[] = ['RUNNING', 'ENROLLING', 'UPCOMING', 'FINISHED', 'ARCHIVED'];
export function sortIntakes(intakes: IntakeOverview[]): IntakeOverview[] {
  return [...intakes].sort((a, b) => ORDER.indexOf(a.phase) - ORDER.indexOf(b.phase)
    || +new Date(b.startDate) - +new Date(a.startDate));
}

export function matches(intake: IntakeOverview, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || `${intake.name} ${intake.code} ${intake.levels.join(' ')}`.toLowerCase().includes(q);
}
