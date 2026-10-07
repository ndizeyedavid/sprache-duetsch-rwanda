import { apiGet } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export function getMyActivitySubmission(activityId: string): Promise<ActivitySubmission | null> {
  return apiGet<ActivitySubmission | null>(`/content/activities/${activityId}/my-submission`);
}
