import { apiDelete } from '.././api';
export function deleteAssessment(id: string): Promise<unknown> {
  return apiDelete(`/assessments/assessments/${id}`);
}
