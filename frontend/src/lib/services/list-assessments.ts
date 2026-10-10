import { apiGet } from '.././api';
import type { AuthoredAssessment } from './authored-assessment';
export function listAssessments(): Promise<AuthoredAssessment[]> {
  return apiGet<AuthoredAssessment[]>('/assessments/assessments?pageSize=100');
}
