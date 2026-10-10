import { apiPatch } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export function gradeActivitySubmission(id: string, body: { score?: number; isCorrect?: boolean; feedback?: string }): Promise<ActivitySubmission> {
  return apiPatch<ActivitySubmission>(`/content/activity-submissions/${id}/grade`, body);
}
