import { apiPost } from '.././api';
import type { AuthoredAssessment } from './authored-assessment';
export function createAssessment(body: Record<string, unknown>): Promise<AuthoredAssessment> {
  return apiPost<AuthoredAssessment>('/assessments/assessments', body);
}
