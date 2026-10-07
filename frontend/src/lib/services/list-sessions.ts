import { apiGet } from '.././api';
import type { SessionItem } from './session-item';
export function listSessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions?pageSize=100');
}
