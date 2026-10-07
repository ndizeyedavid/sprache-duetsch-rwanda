import { apiPost } from '.././api';
import type { SessionItem } from './session-item';
export function createSession(body: Record<string, unknown>): Promise<SessionItem> {
  return apiPost<SessionItem>('/sessions', body);
}
