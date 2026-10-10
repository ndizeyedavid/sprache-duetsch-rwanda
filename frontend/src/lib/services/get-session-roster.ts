import { apiGet } from '.././api';
import type { SessionRosterRow } from './session-roster-row';
export function getSessionRoster(id: string): Promise<SessionRosterRow[]> {
  return apiGet<SessionRosterRow[]>(`/sessions/${id}/roster`);
}
