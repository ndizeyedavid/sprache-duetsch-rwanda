import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { reconcilePayment } from '../../lib/paypack';

type Props = { id: string; onDone: () => void };
export function PaypackReconcileForm({ id, onDone }: Props) {
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <form className="mt-3 space-y-2" onSubmit={event => {
    event.preventDefault(); setBusy(true); setError(null);
    void reconcilePayment(id, reference.trim(), reason.trim()).then(onDone)
      .catch(err => setError(apiErrorMessage(err, 'Could not reconcile payment.'))).finally(() => setBusy(false));
  }}>
    <p className="text-xs text-muted">Find this payment in the Paypack dashboard. The phone and amount must match.</p>
    <label className="block text-xs">Paypack reference<input className="input input-sm mt-1 w-full" required value={reference} onChange={event => setReference(event.target.value)} /></label>
    <label className="block text-xs">Reason<input className="input input-sm mt-1 w-full" minLength={5} required value={reason} onChange={event => setReason(event.target.value)} /></label>
    {error ? <p className="text-sm text-error" role="alert">{error}</p> : null}
    <button className="btn btn-sm" disabled={busy}>{busy ? 'Verifying…' : 'Verify and reconcile'}</button>
  </form>;
}
