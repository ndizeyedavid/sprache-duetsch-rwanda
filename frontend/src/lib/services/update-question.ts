import { apiPatch } from '.././api';
import type { QuestionItem } from './question-item';
export function updateQuestion(id: string, body: Record<string, unknown>): Promise<QuestionItem> {
  return apiPatch<QuestionItem>(`/assessments/questions/${id}`, body);
}
