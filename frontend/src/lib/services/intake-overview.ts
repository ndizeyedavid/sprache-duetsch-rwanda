import { apiGet } from '../api';
import type { Money } from './money';

export type IntakePhase = 'UPCOMING' | 'ENROLLING' | 'RUNNING' | 'FINISHED' | 'ARCHIVED';

/** One intake as the staff intake switcher sees it (GET /intakes/overview). */
export type IntakeOverview = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
  isActive: boolean;
  currency: string;
  phase: IntakePhase;
  /** Registration open now (switched on, not archived, not ended; can be true while RUNNING). */
  enrollmentOpen: boolean;
  levels: string[];
  counts: { students: number; enrollments: number; classes: number };
  /** Finance and super admins only. */
  finance?: { billed: Money; collected: Money; outstanding: Money };
};

export function getIntakeOverview(): Promise<IntakeOverview[]> {
  return apiGet<IntakeOverview[]>('/intakes/overview');
}
