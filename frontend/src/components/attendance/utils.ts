import type { AttendanceStatus } from './constants';

export function rosterStats(rows: { status: string | null }[], marks: Record<string, string>) {
  const pick = (r: { status: string | null; studentId: string }) => marks[r.studentId] ?? r.status ?? '';
  const counts: Record<string, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, UNMARKED: 0 };
  for (const r of rows as { status: string | null; studentId: string }[]) {
    const v = pick(r);
    if (v && counts[v] !== undefined) counts[v]++;
    else counts.UNMARKED++;
  }
  const total = rows.length;
  const marked = total - counts.UNMARKED;
  const presentLike = counts.PRESENT + counts.LATE;
  const rate = total ? Math.round((presentLike / total) * 100) : 0;
  return { counts, total, marked, rate };
}

export function applyBulk(rows: { studentId: string }[], status: AttendanceStatus): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.studentId, status]));
}

export function filterRoster(rows: { firstName: string; lastName: string; studentCode: string }[], q: string) {
  if (!q.trim()) return rows as never[];
  const needle = q.trim().toLowerCase();
  return (rows as never[]).filter((r: never) => {
    const x = r as unknown as { firstName: string; lastName: string; studentCode: string };
    return `${x.firstName} ${x.lastName} ${x.studentCode}`.toLowerCase().includes(needle);
  });
}
