import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { approveClaim,rejectClaim,type StaffPaymentClaim } from '../../lib/payment-claims';
import { money } from '../../lib/services/money';
import { Modal } from '../ui/Modal';
import { amountLabel,dayLabel } from './utils';

type Props = { claim: StaffPaymentClaim | null; mode: 'approve' | 'reject'; onClose: () => void; onDone: (message: string) => void };

/** Approve (optionally correcting the amount) or reject with a reason the student will read. */
export function ReviewClaimDialog({ claim, mode, onClose, onDone }: Props) {
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!claim) return null;
  const name = `${claim.student.user.firstName} ${claim.student.user.lastName}`;
  const approve = mode === 'approve';

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!claim) return;
    setBusy(true); setError(null);
    try {
      if (approve) {
        await approveClaim(claim.id, { amount: amount ? Number(amount) : undefined, note: text.trim() || undefined });
        onDone(`Payment confirmed for ${name}. Receipt issued and balance updated.`);
      } else {
        await rejectClaim(claim.id, text.trim());
        onDone(`Report from ${name} marked as not confirmed. They have been told why.`);
      }
    } catch (err) {
      setError(apiErrorMessage(err, approve ? 'Could not approve this payment.' : 'Could not reject this report.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} busy={busy} title={approve ? 'Confirm payment' : 'Reject payment report'}>
      <form onSubmit={submit} className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-box bg-base-200 p-4 text-xs">
          <div><dt className="text-muted">Student</dt><dd className="font-semibold">{name} · {claim.student.studentCode}</dd></div>
          <div><dt className="text-muted">Reported</dt><dd className="font-semibold">{amountLabel(claim.amount, claim.currency)}</dd></div>
          <div><dt className="text-muted">Method</dt><dd className="font-semibold">{claim.method.name}{claim.reference ? ` · ${claim.reference}` : ''}</dd></div>
          <div><dt className="text-muted">Paid on</dt><dd className="font-semibold">{dayLabel(claim.paidAt)}</dd></div>
        </dl>
        {approve ? (
          <>
            <p className="text-xs text-muted">Check the money arrived (MoMo / bank statement or cash book) before confirming. A receipt is issued straight away.</p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Amount received ({claim.currency})</span>
              <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(money(claim.amount))} className="input w-full" />
              <span className="mt-1 block text-[0.6875rem] text-muted">Leave empty to confirm the reported amount.</span>
            </label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium">Note (optional)</span>
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. Seen on MoMo statement 17 Oct" className="input w-full" /></label>
          </>
        ) : (
          <label className="block"><span className="mb-1.5 block text-xs font-medium">Why can't it be confirmed? The student will see this.</span>
            <textarea required minLength={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. No payment with this reference on our MoMo statement" className="textarea w-full" /></label>
        )}
        {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className={`btn btn-sm rounded-full ${approve ? 'btn-primary' : 'btn-error'}`} disabled={busy}>
            {busy ? <span className="loading loading-spinner loading-xs" /> : null}{approve ? 'Confirm & issue receipt' : 'Reject report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
