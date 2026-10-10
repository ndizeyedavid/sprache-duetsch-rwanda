import { apiPatch } from '.././api';
import type { AuthoredAssessment } from './authored-assessment';
export function updateAssessment(id: string, body: Record<string, unknown>): Promise<AuthoredAssessment> {
  return apiPatch<AuthoredAssessment>(`/assessments/assessments/${id}`, body);
}
