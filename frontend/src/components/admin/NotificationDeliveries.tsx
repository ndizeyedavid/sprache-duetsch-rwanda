import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage,apiGet,apiPost } from '../../lib/api';
type DeliveryState = { emailConfigured: boolean; deliveries: { id: string; email: string; status: string; attempts: number; lastError: string | null }[] };
const load = () => apiGet<DeliveryState>('/notifications/deliveries');
export function NotificationDeliveries() {
  const state = useApi('notification-deliveries', load);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  async function retry(id: string) {
    setBusy(id); setError(null);
    try { await apiPost(`/notifications/deliveries/${id}/retry`); state.refetch(); }
    catch (cause) { setError(apiErrorMessage(cause, 'Could not retry delivery.')); }
    finally { setBusy(null); }
  }
  return <section className="card mt-5 gap-3 border border-base-300 p-4">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Email delivery</h2><button className="btn btn-sm" onClick={state.refetch}>Refresh</button></div>
    {state.loading ? <p role="status" className="text-sm">Loading delivery status…</p> : null}
    {state.data && !state.data.emailConfigured ? <p role="alert" className="alert alert-warning text-sm">Email is not configured. Recovery and reminder emails stay queued until delivery is configured.</p> : null}
    {error || state.error ? <p role="alert" className="text-sm text-error">{error ?? state.error}</p> : null}
    {state.data?.deliveries.length === 0 ? <p className="text-xs text-muted">No pending or failed emails.</p> : null}
    <ul className="space-y-2">{state.data?.deliveries.map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-box bg-base-200 p-3 text-xs"><span>{row.email} · {row.status} · {row.attempts} attempts{row.lastError ? <span className="mt-1 block break-all text-error">{row.lastError}</span> : null}</span>{row.status === 'FAILED' ? <button className="btn btn-xs" disabled={busy === row.id} onClick={() => void retry(row.id)}>Retry</button> : null}</li>)}</ul>
  </section>;
}
