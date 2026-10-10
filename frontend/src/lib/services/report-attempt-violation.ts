import { apiPost } from '.././api';
export function reportAttemptViolation(attemptId: string, type: string): Promise<unknown> {
  return apiPost(`/assessments/my/attempts/${attemptId}/violation`, { type });
}
