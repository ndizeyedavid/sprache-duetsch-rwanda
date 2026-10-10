import { apiGet } from '.././api';
import type { SessionItem } from './session-item';
export function getMySessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions/me?pageSize=50');
}
