import { apiPatch } from '.././api';
import type { SessionItem } from './session-item';
export function updateSession(id: string, body: Record<string, unknown>): Promise<SessionItem> {
  return apiPatch<SessionItem>(`/sessions/${id}`, body);
}
