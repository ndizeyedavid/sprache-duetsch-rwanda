import { apiPut } from '.././api';
import type { AuthoredAssessment } from './authored-assessment';
export function setAssessmentQuestions(
  id: string,
  questions: { questionId: string; order?: number }[],
): Promise<AuthoredAssessment> {
  return apiPut<AuthoredAssessment>(`/assessments/assessments/${id}/questions`, { questions });
}
