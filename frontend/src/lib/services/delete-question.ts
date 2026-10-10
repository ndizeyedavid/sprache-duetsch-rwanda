import { apiDelete } from '.././api';
export function deleteQuestion(id: string): Promise<unknown> {
  return apiDelete(`/assessments/questions/${id}`);
}
