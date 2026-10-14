import { apiPost } from './api';

/** Cancels a session; the reason is stored, audited and sent to enrolled students. */
export function cancelSession(id: string, reason: string) {
  return apiPost<{ id: string; status: string }>(`/sessions/${id}/cancel`, { reason });
}

/** Moves a session (status becomes RESCHEDULED); students are notified with the optional reason. */
export function rescheduleSession(id: string, body: { startAt: string; endAt: string; reason?: string }) {
  return apiPost<{ id: string; status: string }>(`/sessions/${id}/reschedule`, body);
}
