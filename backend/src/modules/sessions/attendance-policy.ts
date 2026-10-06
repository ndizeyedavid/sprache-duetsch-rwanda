import { badRequest,conflict } from '../../lib/http-error.js';
export function assertAttendanceOpen(session: { status: string; startAt: Date }, now = new Date()): void {
  if (session.status === 'CANCELLED') throw conflict('Cancelled sessions do not take attendance');
  if (session.startAt > now) throw conflict('Attendance opens when the session starts');
}
export function assertUniqueStudents(records: { studentId: string }[]): void {
  if (new Set(records.map(r => r.studentId)).size !== records.length) throw badRequest('Each student can appear only once in an attendance batch');
}
