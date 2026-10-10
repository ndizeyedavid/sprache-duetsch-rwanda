import { apiPatch } from '.././api';
import type { EnrollmentRow } from './enrollment-row';
export function updateEnrollment(id: string, body: Record<string, unknown>): Promise<EnrollmentRow> {
  return apiPatch<EnrollmentRow>(`/enrollments/${id}`, body);
}
