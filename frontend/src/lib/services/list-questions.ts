import { apiGet } from '.././api';
import type { QuestionItem } from './question-item';
export function listQuestions(): Promise<QuestionItem[]> {
  return apiGet<QuestionItem[]>('/assessments/questions?pageSize=100');
}
