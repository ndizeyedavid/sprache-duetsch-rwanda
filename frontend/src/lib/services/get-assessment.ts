import { apiGet } from '.././api';
import type { AuthoredAssessment } from './authored-assessment';
export function getAssessment(id: string): Promise<AuthoredAssessment> {
  return apiGet<AuthoredAssessment>(`/assessments/assessments/${id}`);
}
