import { apiGet } from '.././api';
import type { SessionItem } from './session-item';
export function getSession(id: string): Promise<SessionItem> {
  return apiGet<SessionItem>(`/sessions/${id}`);
}
