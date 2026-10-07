import { apiGet } from '.././api';
import type { EnrollmentRow } from './enrollment-row';
export function listEnrollments(): Promise<EnrollmentRow[]> {
  return apiGet<EnrollmentRow[]>('/enrollments?pageSize=100');
}
