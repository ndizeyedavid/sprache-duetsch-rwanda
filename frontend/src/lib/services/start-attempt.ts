import { apiPost } from '.././api';
import type { Money } from './money';
export function startAttempt(assessmentId: string): Promise<{ id: string; status: string; startedAt: string; draftResponses: Record<string, unknown>; maxScore: Money }> {
  return apiPost<{ id: string; status: string; startedAt: string; draftResponses: Record<string, unknown>; maxScore: Money }>(`/assessments/my/assessments/${assessmentId}/attempts`, {});
}
