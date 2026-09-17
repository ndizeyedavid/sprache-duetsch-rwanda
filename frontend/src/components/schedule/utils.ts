import { addDays, format, isSameDay, isToday, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';

export function groupByDay<T extends { startAt: string }>(rows: T[]): { date: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = format(parseISO(row.startAt), 'yyyy-MM-dd');
    const arr = map.get(key) ?? [];
    arr.push(row);
    map.set(key, arr);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, items]) => {
      const d = parseISO(key);
      const label = isToday(d) ? 'Today' : format(d, 'EEEE, d MMMM');
      return { date: key, label, items: items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()) };
    });
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function monthKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function isInWeek(day: Date, anchor: Date): boolean {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return isWithinInterval(day, { start, end });
}

export function dayLabel(d: Date): string {
  return format(d, 'd');
}

export function weekRangeLabel(anchor: Date): string {
  const days = weekDays(anchor);
  const a = days[0];
  const b = days[6];
  if (a.getMonth() === b.getMonth()) return `${format(a, 'd')} – ${format(b, 'd MMMM yyyy')}`;
  return `${format(a, 'd MMM')} – ${format(b, 'd MMM yyyy')}`;
}

export function addDaysSafe(d: Date, n: number): Date { return addDays(d, n); }

export function classAccent(index: number): string {
  const accents = ['border-brand', 'border-info', 'border-success', 'border-sun', 'border-coral'];
  return accents[index % accents.length];
}

export { isSameDay, isToday, parseISO, format };
