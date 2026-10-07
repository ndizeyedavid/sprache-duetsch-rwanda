import { apiPost } from '.././api';
export function reportActivityViolation(activityId: string, type: string): Promise<unknown> {
  return apiPost(`/content/activities/${activityId}/violation`, { type });
}
