import { apiGet } from '.././api';
import type { SessionItem } from './session-item';
export function getUpcomingSessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/sessions/me/upcoming');
}
