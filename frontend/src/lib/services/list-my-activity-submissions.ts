import { apiGet } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export function listMyActivitySubmissions(lessonId?: string): Promise<ActivitySubmission[]> {
  const q = lessonId ? `?lessonId=${lessonId}` : '';
  return apiGet<ActivitySubmission[]>(`/content/my/activity-submissions${q}`);
}
