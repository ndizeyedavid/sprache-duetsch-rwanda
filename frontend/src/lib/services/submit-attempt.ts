import { apiPost } from '.././api';
export function submitAttempt(
  attemptId: string,
  answers: { questionId: string; response: unknown }[],
  requestReview = false,
): Promise<{ status: string; score?: number; maxScore?: number; percentage?: number; passed?: boolean; message?: string }> {
  return apiPost(`/assessments/my/attempts/${attemptId}/submit`, { answers, requestReview });
}
