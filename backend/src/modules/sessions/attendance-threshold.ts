/** Low-attendance threshold resolution. Pure: callers pass the system default (env). */
export type ThresholdSource = 'CLASS' | 'LEVEL' | 'SYSTEM';

export interface ResolvedThreshold {
  /** Percentage below which a student is flagged. */
  value: number;
  source: ThresholdSource;
  /** What the class would use without its own override (level, else system). */
  inherited: number;
  inheritedSource: Exclude<ThresholdSource, 'CLASS'>;
}

type Maybe = number | null | undefined;

export function resolveAttendanceThreshold(classValue: Maybe, levelValue: Maybe, systemValue: number): ResolvedThreshold {
  const hasLevel = levelValue !== null && levelValue !== undefined;
  const inherited = hasLevel ? levelValue : systemValue;
  const inheritedSource = hasLevel ? 'LEVEL' : 'SYSTEM';
  if (classValue !== null && classValue !== undefined) return { value: classValue, source: 'CLASS', inherited, inheritedSource };
  return { value: inherited, source: inheritedSource, inherited, inheritedSource };
}

/** Present + late over all recorded (non-cancelled) sessions, 2 decimals; null with no records. */
export function attendanceRate(statuses: readonly string[]): number | null {
  if (!statuses.length) return null;
  const attended = statuses.filter(status => status === 'PRESENT' || status === 'LATE').length;
  return Math.round((attended / statuses.length) * 10000) / 100;
}
