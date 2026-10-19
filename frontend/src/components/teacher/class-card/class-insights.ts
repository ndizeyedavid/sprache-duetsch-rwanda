import type { HeroArtKey } from '../../hero/hero-art';
import type { TeachingOverview } from '../dashboard-data';

export type ClassInsights = {
  toReview: number;
  nextSession: { id: string; title: string; startAt: string } | null;
  unmarked: number;
};

/** Per-class numbers from the teacher dashboard payload; null until it has loaded (cards show "—"). */
export function classInsights(overview: TeachingOverview | null | undefined, group: { id: string; name: string }, now = new Date()): ClassInsights | null {
  if (!overview) return null;
  const grading = overview.gradingByClass.find((row) => row.classGroupId === group.id);
  const nextSession = [...overview.sessionsToday, ...overview.upcoming]
    .filter((session) => session.classGroup?.id === group.id && new Date(session.endAt) > now && session.status !== 'CANCELLED')
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0] ?? null;
  const unmarked = overview.attendanceNeeds.filter((need) => need.className === group.name).reduce((sum, need) => sum + need.unmarked, 0);
  return { toReview: (grading?.assessments ?? 0) + (grading?.homework ?? 0), nextSession, unmarked };
}

const ART: HeroArtKey[] = ['learners', 'courses', 'notes', 'team', 'teaching'];

/** The four main levels each get their own photo; other levels fall back to a stable hash. */
const LEVEL_ART: Record<string, HeroArtKey> = { A1: 'teaching', A2: 'learners', B1: 'notes', B2: 'courses' };

/** Stable photo per level, so the same level always looks the same and neighbours differ. */
export function artForLevel(code: string): HeroArtKey {
  if (LEVEL_ART[code]) return LEVEL_ART[code];
  const sum = [...code].reduce((total, char) => total + char.charCodeAt(0), 0);
  return ART[sum % ART.length];
}
