import { apiPost } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export function submitActivity(activityId: string, response: unknown): Promise<ActivitySubmission> {
  return apiPost<ActivitySubmission>(`/content/activities/${activityId}/submit`, { response });
}
