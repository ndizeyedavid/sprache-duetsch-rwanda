import type { MyAssessment, MyAttempt } from "../../lib/services";

export function pct(score: number | null, max: number): number | null {
  if (score === null || !max) return null;
  return Math.round((score / max) * 100);
}

export function letter(p: number | null): string {
  if (p === null) return "—";
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

export function toneFor(p: number | null): string {
  if (p === null) return "text-muted";
  if (p >= 80) return "text-success";
  if (p >= 60) return "text-warning";
  return "text-error";
}

export function groupByLevel(assessments: MyAssessment[]) {
  const map = new Map<string, { level: { id: string; code: string; title: string; levelLabel: string }; items: MyAssessment[] }>();
  for (const a of assessments) {
    const key = a.level?.code ?? a.levelId;
    const lvl = a.level ?? { id: a.levelId, code: key, title: key, levelLabel: key };
    const entry = map.get(key) ?? { level: lvl, items: [] };
    entry.items.push(a);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => a.level.code.localeCompare(b.level.code));
}

export function courseAverage(items: MyAssessment[], whatIf: Record<string, number>): number | null {
  let earned = 0;
  let possible = 0;
  for (const a of items) {
    if (!a.maxScore) continue;
    const score = whatIf[a.id] ?? a.bestScore;
    if (score === null || score === undefined) continue;
    earned += score;
    possible += a.maxScore;
  }
  if (!possible) return null;
  return Math.round((earned / possible) * 100);
}

export function trendDirection(attempts: MyAttempt[]): "up" | "down" | "flat" {
  if (attempts.length < 2) return "flat";
  const sorted = [...attempts].filter((a) => a.score !== null).sort((a, b) => new Date(a.submittedAt ?? a.startedAt).getTime() - new Date(b.submittedAt ?? b.startedAt).getTime());
  if (sorted.length < 2) return "flat";
  const first = sorted[0].score! / sorted[0].maxScore;
  const last = sorted[sorted.length - 1].score! / sorted[sorted.length - 1].maxScore;
  if (last > first + 0.03) return "up";
  if (last < first - 0.03) return "down";
  return "flat";
}

export function toCsv(rows: MyAssessment[]): string {
  const header = ["Course", "Assignment", "Type", "Score", "Out of", "%", "Status"];
  const lines = rows.map((r) => [r.level?.code ?? "", `"${r.title.replace(/"/g, '""')}"`, r.type, r.bestScore ?? "", r.maxScore, pct(r.bestScore, r.maxScore) ?? "", r.latestStatus ?? (r.attemptCount ? "GRADED" : "Not started")].join(","));
  return [header.join(","), ...lines].join("\n");
}
