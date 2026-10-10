import { apiPost } from '.././api';
import type { EnrollmentRow } from './enrollment-row';
export function createEnrollment(body: Record<string, unknown>): Promise<EnrollmentRow> {
  return apiPost<EnrollmentRow>('/enrollments', body);
}
