import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { closeUnsubmittedPayment } from '../../lib/paypack';

type Props = { id: string; onDone: () => void };
export function PaypackCloseForm({ id, onDone }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <form className="mt-4 space-y-2 border-t border-base-300 pt-3" onSubmit={event => {
    event.preventDefault(); setBusy(true); setError(null);
    void closeUnsubmittedPayment(id, reason.trim()).then(onDone)
      .catch(err => setError(apiErrorMessage(err, 'Could not close request.'))).finally(() => setBusy(false));
  }}>
    <label className="flex items-start gap-2 text-xs">
      <input type="checkbox" className="checkbox checkbox-sm" checked={confirmed} required onChange={event => setConfirmed(event.target.checked)} />
      I checked Paypack and the payer’s history and confirmed that no payment was accepted or debited.
    </label>
    <label className="block text-xs">Verification details<input className="input input-sm mt-1 w-full" required minLength={10} value={reason} onChange={event => setReason(event.target.value)} /></label>
    {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
    <button className="btn btn-sm" disabled={busy || !confirmed}>{busy ? 'Closing…' : 'Close unsubmitted request'}</button>
  </form>;
}
