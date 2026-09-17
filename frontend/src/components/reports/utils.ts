import { format, parseISO, startOfWeek } from 'date-fns';
import { SCORE_BUCKETS } from './constants';

export type Attempt = { id: string; status: string; score: number | null; maxScore: unknown; submittedAt: string | null; passed: boolean | null; assessment: { id: string; title: string }; student: { studentCode: string; user: { firstName: string; lastName: string } } };

export function toScorePct(att: Attempt): number | null {
  if (att.score === null) return null;
  const max = Number(att.maxScore ?? 0);
  if (!max) return att.score;
  return Math.round((att.score / max) * 100);
}

export function filterByDate(attempts: Attempt[], from: Date | null, to: Date | null): Attempt[] {
  if (!from && !to) return attempts;
  return attempts.filter((a) => {
    const iso = a.submittedAt ?? null;
    if (!iso) return false;
    const d = parseISO(iso);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function trendByWeek(attempts: Attempt[]): { date: string; avg: number; count: number }[] {
  const graded = attempts.filter((a) => a.status === 'GRADED' && toScorePct(a) !== null);
  const map = new Map<string, number[]>();
  for (const a of graded) {
    const pct = toScorePct(a)!;
    const key = format(startOfWeek(parseISO(a.submittedAt!), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const arr = map.get(key) ?? [];
    arr.push(pct);
    map.set(key, arr);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, arr]) => ({ date: format(parseISO(k), 'd MMM'), avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length), count: arr.length }));
}

export function distribution(attempts: Attempt[]): { bucket: string; count: number; color: string }[] {
  const graded = attempts.filter((a) => a.status === 'GRADED' && toScorePct(a) !== null);
  return SCORE_BUCKETS.map((b) => ({ bucket: b.label, count: graded.filter((a) => { const v = toScorePct(a)!; return v >= b.min && v <= b.max; }).length, color: b.color }));
}

export function perAssessment(attempts: Attempt[]): { name: string; avg: number; pass: number }[] {
  const map = new Map<string, number[]>();
  const passMap = new Map<string, number[]>();
  for (const a of attempts) {
    if (a.status !== 'GRADED' || toScorePct(a) === null) continue;
    const k = a.assessment.title;
    const arr = map.get(k) ?? [];
    arr.push(toScorePct(a)!);
    map.set(k, arr);
    const pm = passMap.get(k) ?? [];
    pm.push(a.passed ? 1 : 0);
    passMap.set(k, pm);
  }
  return [...map.entries()].map(([name, arr]) => ({ name: name.slice(0, 18), avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length), pass: Math.round((passMap.get(name)!.reduce((s, v) => s + v, 0) / arr.length) * 100) }));
}

export function studentRows(attempts: Attempt[]): { code: string; name: string; count: number; avg: number | null; passRate: number | null; lastAt: string | null }[] {
  const map = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const k = a.student.studentCode;
    const arr = map.get(k) ?? [];
    arr.push(a);
    map.set(k, arr);
  }
  return [...map.entries()].map(([code, arr]) => {
    const graded = arr.filter((a) => a.status === 'GRADED' && toScorePct(a) !== null);
    const name = `${arr[0].student.user.firstName} ${arr[0].student.user.lastName}`;
    const avg = graded.length ? Math.round(graded.reduce((s, a) => s + toScorePct(a)!, 0) / graded.length) : null;
    const passRate = graded.length ? Math.round((graded.filter((a) => a.passed).length / graded.length) * 100) : null;
    const lastAt = arr.map((a) => a.submittedAt).filter(Boolean).sort().at(-1) ?? null;
    return { code, name, count: arr.length, avg, passRate, lastAt };
  });
}
