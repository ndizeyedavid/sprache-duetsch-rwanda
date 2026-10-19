import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { listOutstanding,settleBalance } from '../../lib/payment-claims';
import { listPaymentMethods } from '../../lib/services';
import { money } from '../../lib/services/money';
import { Modal } from '../ui/Modal';
import { OutstandingPicker,type PickedStudent } from './OutstandingPicker';
import { amountLabel,manualMethod,todayInput } from './utils';

type Props = { open: boolean; onClose: () => void; onDone: (message: string) => void; student?: PickedStudent | null };

/** Settle a student's whole balance in one step — for money received outside the gateway. */
export function MarkPaidDialog({ open, onClose, onDone, student = null }: Props) {
  const outstanding = useApi('outstanding-balances', listOutstanding, open && !student);
  const methods = useApi('payment-methods', listPaymentMethods, open);
  const [picked, setPicked] = useState<PickedStudent | null>(null);
  const [methodId, setMethodId] = useState('');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(todayInput());
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const target = student ?? picked;
  const method = methods.data?.find((row) => row.id === methodId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!target) return;
    setBusy(true); setError(null);
    try {
      await settleBalance(target.id, { methodId, expectedBalance: target.balance, reference: reference.trim() || undefined,
        paidAt: new Date(`${paidAt}T12:00:00`).toISOString(), notes: notes.trim() || undefined });
      onDone(`${target.name} is marked as paid in full (${amountLabel(target.balance, target.currency)}). Receipt issued.`);
      setPicked(null); setReference(''); setNotes('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not mark this student as paid.'));
      outstanding.refetch();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} busy={busy} title="Mark as paid">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-muted">Records one payment for the student's whole outstanding balance, issues a receipt and sets them to Fully paid. Use it when the money arrived outside the gateway.</p>
        {student ? null : <OutstandingPicker rows={outstanding.data ?? []} loading={outstanding.loading} error={outstanding.error} value={picked} onChange={setPicked} />}
        {target ? (
          <div className="hero-band flex items-center justify-between gap-3 rounded-box p-4">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{target.name}</p><p className="font-mono text-[0.6875rem]">{target.code}</p></div>
            <div className="text-right"><p className="text-[0.625rem] uppercase tracking-wider">Amount to record</p><p className="text-xl font-semibold">{amountLabel(target.balance, target.currency)}</p></div>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-xs font-medium">Received by</span>
            <select required value={methodId} onChange={(e) => setMethodId(e.target.value)} className="select w-full">
              <option value="">Choose…</option>
              {(methods.data ?? []).filter(manualMethod).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
            </select></label>
          <label className="block"><span className="mb-1.5 block text-xs font-medium">Date received</span>
            <input required type="date" max={todayInput()} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="input w-full" /></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Transaction reference{method?.requiresReference ? '' : ' (optional)'}</span>
          <input required={Boolean(method?.requiresReference)} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} placeholder="MoMo / bank transaction ID" className="input w-full font-mono" /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Note (optional)</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="e.g. Paid in cash at the Kacyiru desk" className="input w-full" /></label>
        {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm rounded-full" disabled={busy || !target || !methodId || money(target.balance) <= 0}>
            {busy ? <span className="loading loading-spinner loading-xs" /> : null}Mark as paid
          </button>
        </div>
      </form>
    </Modal>
  );
}
