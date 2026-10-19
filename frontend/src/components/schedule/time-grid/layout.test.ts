import { describe,expect,it } from 'vitest';
import { initialScrollHour,layoutDay,pastCutoff } from './layout';

const at = (h: number, m = 0) => new Date(2026, 9, 17, h, m).toISOString();
const s = (id: string, from: [number, number?], to: [number, number?]) =>
  ({ id, title: id, startAt: at(...from), endAt: at(...to), status: 'SCHEDULED', classGroup: null });
const day = new Date(2026, 9, 17);

describe('layoutDay', () => {
  it('positions a session in minutes from midnight', () => {
    const [placed] = layoutDay([s('a', [9, 30], [11])], day);
    expect([placed.start, placed.end, placed.lane, placed.lanes]).toEqual([570, 660, 0, 1]);
  });
  it('splits overlapping sessions into lanes and reuses freed lanes', () => {
    const placed = layoutDay([s('a', [9], [11]), s('b', [10], [12]), s('c', [11], [13])], day);
    const byId = Object.fromEntries(placed.map((p) => [p.session.id, p]));
    expect(byId.a.lane).toBe(0);
    expect(byId.b.lane).toBe(1);
    expect(byId.c.lane).toBe(0);
    expect(placed.every((p) => p.lanes === 2)).toBe(true);
  });
  it('keeps separate clusters independent', () => {
    const placed = layoutDay([s('a', [8], [9]), s('b', [8], [9]), s('c', [14], [15])], day);
    expect(placed.find((p) => p.session.id === 'c')?.lanes).toBe(1);
  });
  it('ignores other days and gives tiny sessions a readable height', () => {
    expect(layoutDay([s('a', [9], [10])], new Date(2026, 9, 18))).toEqual([]);
    const [short] = layoutDay([s('a', [9], [9, 5])], day);
    expect(short.end - short.start).toBe(20);
  });
});

describe('08:00–22:00 window', () => {
  it('pins classes outside school hours to the edge, marked, keeping a readable height', () => {
    const [early] = layoutDay([s('early', [3], [4, 30])], day);
    expect(early).toMatchObject({ start: 480, end: 510, outside: 'before', clippedStart: true });
    const [late] = layoutDay([s('late', [22, 30], [23, 30])], day);
    expect(late).toMatchObject({ start: 1290, end: 1320, outside: 'after' });
  });
  it('clips classes that straddle the window to the visible part', () => {
    const [straddle] = layoutDay([s('morning', [7], [9])], day);
    expect(straddle).toMatchObject({ start: 480, end: 540, outside: null, clippedStart: true, clippedEnd: false });
    const [evening] = layoutDay([s('evening', [21], [23])], day);
    expect(evening).toMatchObject({ start: 1260, end: 1320, clippedEnd: true });
  });
});

describe('initialScrollHour', () => {
  it('opens at whichever comes first: the first class or two hours before now — never before 08:00', () => {
    expect(initialScrollHour([], new Date(2026, 9, 17, 15))).toBe(13);
    expect(initialScrollHour([{ start: 180 }], new Date(2026, 9, 17, 15))).toBe(8);
    expect(initialScrollHour([{ start: 600 }], null)).toBe(9);
    expect(initialScrollHour([], null)).toBe(8);
  });
});

describe('pastCutoff', () => {
  const now = new Date(2026, 9, 18, 10, 10);
  it('blocks a whole past day and nothing on a future day', () => {
    expect(pastCutoff(new Date(2026, 9, 17), now)).toBe(22 * 60);
    expect(pastCutoff(new Date(2026, 9, 19), now)).toBe(8 * 60);
  });
  it('blocks today up to the next half-hour slot', () => {
    expect(pastCutoff(new Date(2026, 9, 18), now)).toBe(10 * 60 + 30);
    expect(pastCutoff(new Date(2026, 9, 18), new Date(2026, 9, 18, 6, 0))).toBe(8 * 60);
  });
});
