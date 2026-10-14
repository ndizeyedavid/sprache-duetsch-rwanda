import { attendanceRate } from './attendance-threshold.js';

/** Pure rules for low-attendance alerts: who is flagged, who hears about it, and dedupe keys. */
export interface RosterAttendance { studentId: string; userId: string; name: string; statuses: readonly string[] }
export interface BelowThreshold { studentId: string; userId: string; name: string; percentage: number }

/** UTC day bucket used for "at most one alert per class per day". */
export function alertDayKey(now = new Date()): string {
  const day = new Date(now);
  day.setUTCHours(0, 0, 0, 0);
  return day.toISOString();
}

/** notifyUsers appends `:userId`, so each key is unique per recipient + class + day. */
export const studentAlertKey = (classGroupId: string, day: string) => `attendance:${classGroupId}:${day}`;
export const digestAlertKey = (classGroupId: string, day: string) => `attendance-digest:${classGroupId}:${day}`;

export function studentsBelowThreshold(rows: readonly RosterAttendance[], threshold: number): BelowThreshold[] {
  return rows.flatMap(row => {
    const percentage = attendanceRate(row.statuses);
    return percentage !== null && percentage < threshold
      ? [{ studentId: row.studentId, userId: row.userId, name: row.name, percentage }]
      : [];
  }).sort((a, b) => a.percentage - b.percentage || a.name.localeCompare(b.name));
}

/** Class teacher plus academic/super admins, once each. Finance staff are never passed in. */
export function staffAlertRecipients(teacherId: string | null | undefined, adminIds: readonly string[]): string[] {
  return [...new Set([...(teacherId ? [teacherId] : []), ...adminIds])];
}

export function digestBody(className: string, threshold: number, rows: readonly BelowThreshold[], limit = 8): string {
  const listed = rows.slice(0, limit).map(row => `${row.name} (${row.percentage}%)`).join(', ');
  const more = rows.length > limit ? ` and ${rows.length - limit} more` : '';
  const noun = rows.length === 1 ? 'student is' : 'students are';
  return `${rows.length} ${noun} below the ${threshold}% attendance threshold in ${className}: ${listed}${more}.`;
}
