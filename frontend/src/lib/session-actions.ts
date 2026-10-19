import { apiDelete,apiPost } from './api';

/** Cancels a session; the reason is stored, audited and sent to enrolled students. */
export function cancelSession(id: string, reason: string) {
  return apiPost<{ id: string; status: string }>(`/sessions/${id}/cancel`, { reason });
}

/** Moves a session (status becomes RESCHEDULED); students are notified with the optional reason. */
export function rescheduleSession(id: string, body: { startAt: string; endAt: string; reason?: string }) {
  return apiPost<{ id: string; status: string }>(`/sessions/${id}/reschedule`, body);
}

/** Deletes a class with no attendance history (otherwise the API asks to cancel it instead). */
export function deleteSession(id: string, reason?: string) {
  return apiDelete<{ id: string }>(`/sessions/${id}`, reason ? { data: { reason } } : undefined);
}
