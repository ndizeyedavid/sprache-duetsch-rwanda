import { endOfDay,isSameDay,startOfDay } from 'date-fns';
import { DAY_END_MIN,DAY_START_MIN,SLOT_MINUTES } from './constants';

export type GridSession = {
  id: string; title: string; startAt: string; endAt: string; status: string;
  classGroup: { name: string } | null; mode?: string; room?: string | null;
};

export type PlacedSession<T extends GridSession = GridSession> = {
  session: T;
  /** Minutes from midnight (clamped to the day) — drive `top` and `height`. */
  start: number;
  end: number;
  /** Side-by-side position when sessions overlap: lane index out of `lanes`. */
  lane: number;
  lanes: number;
  /** Starts before or runs past the visible window (08:00–22:00) or this day. */
  clippedStart: boolean;
  clippedEnd: boolean;
  /** Entirely outside the visible hours: shown as a short marker at the top or bottom edge. */
  outside: 'before' | 'after' | null;
};

export const MIN_BLOCK_MINUTES = 20;
/** Classes outside 08:00–22:00 get a slightly taller edge marker so their time and title stay legible. */
export const OUTSIDE_BLOCK_MINUTES = 30;

const minutesInto = (date: Date, day: Date) => Math.round((date.getTime() - startOfDay(day).getTime()) / 60_000);

/** Sessions touching `day`, positioned in minutes with overlapping ones split into lanes. */
export function layoutDay<T extends GridSession>(sessions: T[], day: Date): PlacedSession<T>[] {
  const dayStart = startOfDay(day), dayEnd = endOfDay(day);
  const items = sessions
    .map((session) => ({ session, from: new Date(session.startAt), to: new Date(session.endAt) }))
    .filter(({ from, to }) => from <= dayEnd && (to > dayStart || isSameDay(from, day)))
    .map(({ session, from, to }) => {
      const rawStart = Math.max(0, minutesInto(from, day));
      const rawEnd = Math.min(24 * 60, Math.max(rawStart + MIN_BLOCK_MINUTES, minutesInto(to, day)));
      const outside = rawEnd <= DAY_START_MIN ? 'before' as const : rawStart >= DAY_END_MIN ? 'after' as const : null;
      const start = outside === 'before' ? DAY_START_MIN : outside === 'after' ? DAY_END_MIN - OUTSIDE_BLOCK_MINUTES : Math.max(rawStart, DAY_START_MIN);
      const end = outside === 'before' ? DAY_START_MIN + OUTSIDE_BLOCK_MINUTES : outside === 'after' ? DAY_END_MIN : Math.max(start + MIN_BLOCK_MINUTES, Math.min(rawEnd, DAY_END_MIN));
      return { session, start, end, lane: 0, lanes: 1, outside,
        clippedStart: from < dayStart || rawStart < DAY_START_MIN, clippedEnd: to > dayEnd || rawEnd > DAY_END_MIN };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  // Group transitively-overlapping sessions into clusters; each cluster shares one lane count.
  let cluster: PlacedSession<T>[] = [];
  let clusterEnd = -1;
  const laneEnds: number[] = [];
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((item) => item.lane + 1));
    for (const item of cluster) item.lanes = lanes;
    cluster = [];
    laneEnds.length = 0;
  };
  for (const item of items) {
    if (cluster.length && item.start >= clusterEnd) flush();
    const free = laneEnds.findIndex((end) => end <= item.start);
    item.lane = free === -1 ? laneEnds.length : free;
    laneEnds[item.lane] = item.end;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  if (cluster.length) flush();
  return items;
}

/** First hour scrolled into view: just above the earliest class, or two hours before "now" if that is earlier — never before 08:00. */
export function initialScrollHour(placed: { start: number }[], now: Date | null): number {
  const first = DAY_START_MIN / 60;
  const earliest = Math.min(...placed.map((item) => item.start));
  const candidates = [
    ...(Number.isFinite(earliest) ? [Math.floor(earliest / 60) - 1] : []),
    ...(now ? [now.getHours() - 2] : []),
  ];
  return candidates.length ? Math.max(first, Math.min(...candidates)) : first;
}

export const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/**
 * Minute-of-day before which a column is in the past (no new classes there): the whole day for
 * past days, "now" rounded up to the next slot for today, nothing for future days.
 */
export function pastCutoff(day: Date, now: Date): number {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (dayStart < todayStart) return DAY_END_MIN;
  if (dayStart > todayStart) return DAY_START_MIN;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(DAY_END_MIN, Math.max(DAY_START_MIN, Math.ceil(minutes / SLOT_MINUTES) * SLOT_MINUTES));
}
