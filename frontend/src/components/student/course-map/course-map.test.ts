import { describe,expect,it } from 'vitest';
import type { MyCourse } from '../../../lib/services';
import { courseStops } from './course-map';

const lesson = (id: string, order: number, progressStatus = 'NOT_STARTED', coverUrl: string | null = null) =>
  ({ id, title: id, description: null, order, contentType: 'TEXT', estimatedMinutes: 30, progressStatus, secondsWatched: 0, completedAt: null, coverUrl });
const course = (modules: { id: string; order: number; lessons: ReturnType<typeof lesson>[] }[]) =>
  ({ level: { id: 'l', code: 'A1', title: 'A1', levelLabel: '', summary: null, order: 1 }, modules: modules.map((m) => ({ ...m, title: m.id, description: null })), stats: { totalLessons: 0, completedLessons: 0, completionPercentage: 0 } }) as MyCourse;

describe('courseStops', () => {
  it('marks finished modules, the one current stop and what is ahead', () => {
    const stops = courseStops(course([
      { id: 'm2', order: 2, lessons: [lesson('c', 1), lesson('d', 2)] },
      { id: 'm1', order: 1, lessons: [lesson('a', 1, 'COMPLETED', '/p/a.webp'), lesson('b', 2, 'COMPLETED')] },
      { id: 'm3', order: 3, lessons: [lesson('e', 1)] },
    ]));
    expect(stops.map((s) => [s.id, s.state, s.done, s.total])).toEqual([['m1', 'done', 2, 2], ['m2', 'current', 0, 2], ['m3', 'upcoming', 0, 1]]);
    expect(stops[0].cover).toBe('/p/a.webp');
    expect(stops[1].target?.id).toBe('c');
    expect(stops[1].minutes).toBe(60);
  });
  it('prefers the lesson already in progress', () => {
    const [stop] = courseStops(course([{ id: 'm', order: 1, lessons: [lesson('a', 1), lesson('b', 2, 'IN_PROGRESS')] }]));
    expect(stop.target?.id).toBe('b');
  });
});
