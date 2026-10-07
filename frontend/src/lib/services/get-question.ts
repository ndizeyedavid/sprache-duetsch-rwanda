import { apiGet } from '.././api';
import type { QuestionItem } from './question-item';
export function getQuestion(id: string): Promise<QuestionItem> {
  return apiGet<QuestionItem>(`/assessments/questions/${id}`);
}
