import { apiGet } from '.././api';
import type { StudentAttendanceRow } from './student-attendance-row';
import type { StudentDetail } from './student-detail';
export function getStudentAttendance(studentId: string): Promise<{ attendance: StudentAttendanceRow[]; summary: StudentDetail['attendance'] }> {
  return apiGet(`/students/${studentId}/attendance`);
}
