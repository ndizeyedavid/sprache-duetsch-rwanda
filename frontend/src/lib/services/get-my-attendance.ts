import { apiGet } from '.././api';
import type { AttendanceRecord } from './attendance-record';
import type { AttendanceSummary } from './attendance-summary';
export function getMyAttendance(): Promise<{ history: AttendanceRecord[]; summary: AttendanceSummary }> {
  return apiGet('/attendance/me');
}
