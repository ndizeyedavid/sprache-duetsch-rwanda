import { apiPost } from '.././api';
import type { QuestionItem } from './question-item';
export function createQuestion(body: Record<string, unknown>): Promise<QuestionItem> {
  return apiPost<QuestionItem>('/assessments/questions', body);
}
