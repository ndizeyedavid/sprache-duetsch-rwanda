import { describe,expect,it } from 'vitest';
import type { TeachingOverview } from '../dashboard-data';
import { artForLevel,classInsights } from './class-insights';

const session = (id: string, classId: string, start: string, end: string, status = 'SCHEDULED') =>
  ({ id, title: id, startAt: start, endAt: end, status, classGroup: { id: classId, code: 'C', name: 'Class' } });

const overview = {
  gradingByClass: [{ classGroupId: 'c1', className: 'A1 Evening', assessments: 2, homework: 1 }],
  sessionsToday: [session('past', 'c1', '2026-10-17T08:00:00Z', '2026-10-17T09:00:00Z')],
  upcoming: [
    session('later', 'c1', '2026-10-20T08:00:00Z', '2026-10-20T09:00:00Z'),
    session('cancelled', 'c1', '2026-10-18T08:00:00Z', '2026-10-18T09:00:00Z', 'CANCELLED'),
    session('other', 'c2', '2026-10-18T08:00:00Z', '2026-10-18T09:00:00Z'),
  ],
  attendanceNeeds: [{ id: 'x', title: null, className: 'A1 Evening', startAt: '', unmarked: 3 }],
} as unknown as TeachingOverview;

describe('classInsights', () => {
  it('sums work to review, finds the next live class and open registers', () => {
    const insights = classInsights(overview, { id: 'c1', name: 'A1 Evening' }, new Date('2026-10-17T12:00:00Z'));
    expect(insights).toEqual({ toReview: 3, nextSession: expect.objectContaining({ id: 'later' }), unmarked: 3 });
  });
  it('is null until the overview loads', () => {
    expect(classInsights(null, { id: 'c1', name: 'x' })).toBeNull();
  });
  it('gives each level a stable photo and the main levels distinct ones', () => {
    expect(artForLevel('B1-BERUF')).toBe(artForLevel('B1-BERUF'));
    expect(new Set(['A1', 'A2', 'B1', 'B2'].map(artForLevel)).size).toBe(4);
  });
});
