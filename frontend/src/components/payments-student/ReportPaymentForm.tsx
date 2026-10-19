import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { submitClaim } from '../../lib/payment-claims';
import type { PaymentMethod } from '../../lib/services/payment-method';
import { reportable,todayInput } from '../payment-claims/utils';

type Props = { methods: PaymentMethod[]; balance: number; currency: string; onSubmitted: () => void };

/** "I paid by MoMo / bank / cash" — reference and date go to finance for confirmation. */
export function ReportPaymentForm({ methods, balance, currency, onSubmitted }: Props) {
  const options = methods.filter(reportable);
  const [methodId, setMethodId] = useState('');
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : '');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(todayInput());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const method = options.find((row) => row.id === methodId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null); setDone(false);
    try {
      await submitClaim({ methodId, amount: Number(amount), reference: reference.trim() || undefined,
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(), note: note.trim() || undefined });
      setDone(true); setReference(''); setNote('');
      onSubmitted();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send your payment report.'));
    } finally {
      setBusy(false);
    }
  }

  if (!options.length) return <p className="text-xs text-muted">Payments outside the app are recorded by the finance office.</p>;
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-xs font-medium">How did you pay?</span>
          <select required value={methodId} onChange={(e) => setMethodId(e.target.value)} className="select w-full">
            <option value="">Choose…</option>
            {options.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Amount paid ({currency})</span>
          <input required type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className="input w-full" /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Transaction reference{method && !method.requiresReference ? ' (optional)' : ''}</span>
          <input required={Boolean(method?.requiresReference)} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120}
            placeholder="From your SMS or bank slip" className="input w-full font-mono" /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Date paid</span>
          <input required type="date" max={todayInput()} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="input w-full" /></label>
      </div>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Anything finance should know? (optional)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Paid by my brother from 078…" className="input w-full" /></label>
      {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}
      {done ? <p role="status" className="alert alert-success alert-soft text-xs">Thanks! Finance will check it and confirm — you'll get a notification and a receipt.</p> : null}
      <button type="submit" className="btn btn-primary btn-sm w-full rounded-full sm:w-auto" disabled={busy || !methodId}>
        {busy ? <span className="loading loading-spinner loading-xs" /> : null}Send for confirmation
      </button>
    </form>
  );
}
