import { apiGet } from '.././api';
import type { StaffAttempt } from './staff-attempt';
export function getStaffAttempt(id: string): Promise<StaffAttempt> {
  return apiGet<StaffAttempt>(`/assessments/attempts/${id}`);
}
