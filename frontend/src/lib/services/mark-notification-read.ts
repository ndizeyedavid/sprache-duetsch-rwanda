import { apiPatch } from '.././api';
export function markNotificationRead(id: string): Promise<unknown> {
  return apiPatch(`/notifications/${id}/read`, {});
}
