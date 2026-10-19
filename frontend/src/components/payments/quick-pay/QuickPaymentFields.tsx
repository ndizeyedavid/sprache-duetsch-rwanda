import { currencyAmount } from '../../../lib/format';
import { manualMethod,todayInput } from '../../payment-claims/utils';
import { amountOptions,type BalanceInfo } from './quick-pay';
import type { QuickPayment } from './useQuickPayment';

const label = 'mb-1.5 block text-xs font-medium';
const chip = (active: boolean) => `btn btn-sm rounded-full ${active ? 'btn-primary' : 'border-line bg-base-100'}`;

/** Amount (with one-tap options), method buttons, reference, date, enrolment and note. */
export function QuickPaymentFields({ pay, info }: { pay: QuickPayment; info: BalanceInfo }) {
  const { values: v, set } = pay;
  const methods = pay.methods.filter(manualMethod);
  return (
    <div className="space-y-5">
      <div>
        <span className={label}>Amount received ({info.currency})</span>
        <input data-autofocus required type="number" min="1" step="1" inputMode="numeric" value={v.amount} onChange={(e) => set.setAmount(e.target.value)}
          className="input input-lg w-full text-2xl font-semibold" aria-label="Amount received" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {amountOptions(info).map((o) => (
            <button key={o.label} type="button" className={chip(Number(v.amount) === o.amount)} onClick={() => set.setAmount(String(o.amount))}>
              {o.label} · {currencyAmount(o.amount, info.currency)}
            </button>
          ))}
        </div>
        {Number(v.amount) > info.balance ? <p className="mt-1.5 text-[0.6875rem] text-warning">More than the balance — the extra stays as credit on the account.</p> : null}
      </div>
      <div>
        <span className={label}>Received by</span>
        {pay.methodsLoading ? <p className="text-xs text-muted">Loading methods…</p> : (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Payment method">
            {methods.map((m) => <button key={m.id} type="button" aria-pressed={v.methodId === m.id} className={chip(v.methodId === m.id)} onClick={() => set.setMethodId(m.id)}>{m.name}</button>)}
          </div>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={label}>Reference{pay.method?.requiresReference ? '' : ' (optional)'}</span>
          <input required={Boolean(pay.method?.requiresReference)} value={v.reference} onChange={(e) => set.setReference(e.target.value)} maxLength={120} placeholder="MoMo / bank transaction ID" className="input w-full font-mono" /></label>
        <label className="block"><span className={label}>Date received</span>
          <input required type="date" max={todayInput()} value={v.paidAt} onChange={(e) => set.setPaidAt(e.target.value)} className="input w-full" /></label>
      </div>
      {pay.enrollments.length > 1 ? (
        <label className="block"><span className={label}>For which course</span>
          <select value={v.enrollmentId} onChange={(e) => set.setEnrollmentId(e.target.value)} className="select w-full">
            <option value="">Whole account (not tied to one course)</option>
            {pay.enrollments.map((row) => <option key={row.id} value={row.id}>{row.level.code} · {row.intake.name}{row.status !== 'ACTIVE' ? ` (${row.status.toLowerCase()})` : ''}</option>)}
          </select></label>
      ) : null}
      <label className="block"><span className={label}>Note (optional)</span>
        <input value={v.notes} onChange={(e) => set.setNotes(e.target.value)} maxLength={500} placeholder="e.g. Paid at the Kacyiru desk" className="input w-full" /></label>
      {pay.error ? <p role="alert" className="alert alert-error alert-soft text-xs">{pay.error}</p> : null}
    </div>
  );
}
