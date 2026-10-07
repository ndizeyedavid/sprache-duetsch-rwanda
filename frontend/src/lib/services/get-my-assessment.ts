import { apiGet } from '.././api';
import type { MyAssessmentDetail } from './my-assessment-detail';
export function getMyAssessment(id: string): Promise<MyAssessmentDetail> {
  return apiGet<MyAssessmentDetail>(`/assessments/my/assessments/${id}`);
}
