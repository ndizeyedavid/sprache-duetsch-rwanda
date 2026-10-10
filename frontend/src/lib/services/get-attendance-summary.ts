import { apiGet } from '.././api';
import type { AttendanceSummary } from './attendance-summary';
export function getAttendanceSummary(): Promise<AttendanceSummary> {
  return apiGet('/attendance/summary');
}
