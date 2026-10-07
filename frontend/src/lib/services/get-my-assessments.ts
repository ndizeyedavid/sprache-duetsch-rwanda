import { apiGet } from '.././api';
import type { MyAssessment } from './my-assessment';
export function getMyAssessments(): Promise<MyAssessment[]> {
  return apiGet<MyAssessment[]>('/assessments/my/assessments?pageSize=50');
}
