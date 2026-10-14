import { apiGet } from '.././api';
import type { MyProgressLevel } from './my-progress-level';
export function getStudentProgress(studentId: string): Promise<{ levels: MyProgressLevel[]; overallPercentage: number }> {
  return apiGet(`/students/${studentId}/progress`);
}
