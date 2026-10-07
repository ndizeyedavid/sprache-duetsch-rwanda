import { apiDelete } from '.././api';
export function deleteActivity(id: string): Promise<unknown> {
  return apiDelete(`/content/activities/${id}`);
}
