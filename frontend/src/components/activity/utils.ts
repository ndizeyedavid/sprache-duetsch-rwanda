import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function dayKey(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, d MMMM yyyy');
  } catch { return iso; }
}

export function groupByDay<T extends { createdAt: string }>(rows: T[]): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const k = dayKey(r.createdAt);
    const arr = map.get(k) ?? [];
    arr.push(r);
    map.set(k, arr);
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }));
}

export function relative(iso: string): string {
  try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }); } catch { return ''; }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '•';
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
