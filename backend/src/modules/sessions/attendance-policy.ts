import { badRequest,conflict } from '../../lib/http-error.js';
export function assertAttendanceOpen(session: { status: string; startAt: Date }, now = new Date()): void {
  if (session.status === 'CANCELLED') throw conflict('Cancelled sessions do not take attendance');
  if (session.startAt > now) throw conflict('Attendance opens when the session starts');
}
export function assertUniqueStudents(records: { studentId: string }[]): void {
  if (new Set(records.map(r => r.studentId)).size !== records.length) throw badRequest('Each student can appear only once in an attendance batch');
}

/** Joining through the class link counts from shortly before the start until the session ends. */
export const JOIN_OPENS_MINUTES = 15;
/** Joining later than this after the start is recorded as LATE instead of PRESENT. */
export const LATE_AFTER_MINUTES = 10;

/** Attendance earned by opening the class link at `now`, or null when the click should not count. */
export function joinAttendanceStatus(session: { status: string; startAt: Date; endAt: Date }, now = new Date()): 'PRESENT' | 'LATE' | null {
  if (['CANCELLED', 'COMPLETED'].includes(session.status)) return null;
  const opens = session.startAt.getTime() - JOIN_OPENS_MINUTES * 60_000;
  if (now.getTime() < opens || now >= session.endAt) return null;
  return now.getTime() > session.startAt.getTime() + LATE_AFTER_MINUTES * 60_000 ? 'LATE' : 'PRESENT';
}
