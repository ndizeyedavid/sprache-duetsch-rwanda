import { apiGet } from '.././api';
import type { StudentDetail } from './student-detail';
export function getStudent(studentId: string): Promise<StudentDetail> {
  return apiGet<StudentDetail>(`/students/${studentId}`);
}
