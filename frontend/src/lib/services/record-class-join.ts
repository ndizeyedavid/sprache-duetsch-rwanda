import { apiPost } from '.././api';
/** Checks the signed-in student in for a session when they open its class link. */
export function recordClassJoin(sessionId: string): Promise<{ recorded: boolean; status: string | null }> {
  return apiPost(`/sessions/me/${sessionId}/join`);
}
