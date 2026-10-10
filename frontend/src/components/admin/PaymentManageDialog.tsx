import type { FormEvent } from 'react';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiDelete, apiErrorMessage, apiPatch, apiPost } from '../../lib/api';
import { currencyAmount } from '../../lib/format';
import type { PaymentRow } from '../../lib/services';
import { listPaymentMethods, money } from '../../lib/services';
import { Modal } from '../ui/Modal';

type Action = 'CORRECT' | 'REFUND' | 'VOID';
export function PaymentManageDialog({ payment, onClose, onSaved }: { payment: PaymentRow; onClose: () => void; onSaved: () => void }) {
  const methods = useApi('refund-payment-methods', listPaymentMethods);
  const [action, setAction] = useState<Action>('CORRECT');
  const [amount, setAmount] = useState(String(payment.amount));
  const [reference, setReference] = useState(payment.reference ?? '');
  const [reason, setReason] = useState('');
  const [methodId, setMethodId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refunded = (payment.refunds ?? []).reduce((sum, row) => sum + money(row.amount), 0);
  const remaining = Math.max(0, money(payment.amount) - refunded);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      if (action === 'CORRECT') await apiPatch(`/payments/${payment.id}`, { amount: Number(amount), reference: reference.trim() || undefined, reason: reason.trim() });
      else if (action === 'REFUND') await apiPost('/payments/refunds', { paymentId: payment.id, amount: Number(amount), reason: reason.trim(), methodId: methodId || undefined });
      else await apiDelete(`/payments/${payment.id}`, { data: { reason: reason.trim() } });
      onSaved(); onClose();
    } catch (cause) { setError(apiErrorMessage(cause, 'Payment change could not be saved.')); }
    finally { setBusy(false); }
  }
  function choose(next: Action) { setAction(next); setAmount(String(next === 'REFUND' ? remaining : payment.amount)); setError(null); }
  return <Modal open busy={busy} onClose={onClose} title="Manage payment">
    <form onSubmit={save} className="space-y-3">
      <p className="text-sm">{payment.student.user.firstName} {payment.student.user.lastName} · {payment.student.studentCode}</p>
      <p className="text-xs">Received {currencyAmount(money(payment.amount), payment.currency)} · Refunded {currencyAmount(refunded, payment.currency)}</p>
      <label className="block text-xs">Action<select className="select mt-1 w-full" value={action} disabled={busy} onChange={event => choose(event.target.value as Action)}>
        <option value="CORRECT">Correct amount or reference</option><option value="REFUND" disabled={remaining <= 0}>Record refund</option><option value="VOID">Void payment</option>
      </select></label>
      {action !== 'VOID' ? <label className="block text-xs">{action === 'REFUND' ? 'Refund amount' : 'Correct received amount'} ({payment.currency})<input className="input mt-1 w-full" type="number" min="0.01" step="0.01" max={action === 'REFUND' ? remaining : undefined} required value={amount} disabled={busy} onChange={event => setAmount(event.target.value)} /></label> : <p className="alert alert-warning text-xs">Voiding refunds the remaining amount and marks the receipt void. The original payment stays in the audit history.</p>}
      {action === 'CORRECT' ? <label className="block text-xs">Transaction reference<input className="input mt-1 w-full" value={reference} disabled={busy} onChange={event => setReference(event.target.value)} /></label> : null}
      {action === 'REFUND' ? <label className="block text-xs">Refund method<select className="select mt-1 w-full" value={methodId} onChange={event => setMethodId(event.target.value)} disabled={busy}>
        <option value="">Original payment method</option>{methods.data?.filter(row => row.isActive !== false).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select>{methods.error ? <span className="text-error">{methods.error}</span> : null}</label> : null}
      <label className="block text-xs">Reason<textarea className="textarea mt-1 w-full" required minLength={3} maxLength={500} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-sm" disabled={busy} onClick={onClose}>Cancel</button><button className="btn btn-sm btn-primary" disabled={busy}>{busy ? 'Saving…' : action === 'VOID' ? 'Void payment' : 'Save change'}</button></div>
    </form>
  </Modal>;
}
