import { apiGet } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export function listActivitySubmissions(params?: { lessonId?: string; activityId?: string; studentId?: string; status?: string }): Promise<ActivitySubmission[]> {
  const search = new URLSearchParams();
  if (params?.lessonId) search.set('lessonId', params.lessonId);
  if (params?.activityId) search.set('activityId', params.activityId);
  if (params?.studentId) search.set('studentId', params.studentId);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  return apiGet<ActivitySubmission[]>(`/content/activity-submissions${qs ? `?${qs}` : ''}`);
}
