type Policy = { allowLate: boolean; gracePeriodMinutes: number; latePenaltyPercentPerDay: string | number; latePenaltyMaxPercent: string | number };

/** "45 min", "3 h 5 min", "2 d 4 h" — short, for late badges. */
export function lateDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
  const hours = Math.floor((minutes % 1440) / 60);
  return `${Math.floor(minutes / 1440)} d${hours ? ` ${hours} h` : ''}`;
}

/** One sentence students read before the deadline, e.g. "Accepted with 10% off per late day (max 30%) after 15 min grace". */
export function latePolicyLabel(p: Policy): string {
  if (!p.allowLate) return 'Not accepted after the deadline';
  const perDay = Number(p.latePenaltyPercentPerDay), max = Number(p.latePenaltyMaxPercent);
  const grace = p.gracePeriodMinutes ? ` after ${lateDuration(p.gracePeriodMinutes)} grace` : '';
  if (!perDay || !max) return `Accepted, marked as late${grace}`;
  return `Accepted with ${perDay}% off per late day (max ${max}%)${grace}`;
}

/** Penalty applied to a graded piece of work, if any. */
export function appliedPenalty(s: { rawScore?: string | null; latePenaltyPercent?: string | null; score: string | null }) {
  const percent = Number(s.latePenaltyPercent ?? 0);
  return percent > 0 && s.rawScore != null ? { percent, rawScore: Number(s.rawScore), score: Number(s.score) } : null;
}

/** Mirrors the server: score = teacher score × (1 − penalty%), in exact hundredths. */
export function scoreAfterPenalty(rawScore: number, penaltyPercent: number): number {
  const percent = Math.min(100, Math.max(0, Number.isFinite(penaltyPercent) ? penaltyPercent : 0));
  return Math.round((Math.round(rawScore * 100) * (10_000 - Math.round(percent * 100))) / 10_000) / 100;
}
