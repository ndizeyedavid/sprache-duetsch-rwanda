import { FiDownload,FiEye } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { isoDate } from '../../lib/services/iso-date';
import { money } from '../../lib/services/money';
import type { MyPaymentRow } from '../../lib/student-payments';
import { Panel } from '../ui/Panel';

type Receipt = NonNullable<MyPaymentRow['receipt']>;

type Props = {
  payments: MyPaymentRow[];
  pendingId: string | null;
  downloadError: string | null;
  onView: (receipt: Receipt) => void;
  onDownload: (receipt: Receipt) => void;
};

/** Every confirmed payment — cash, bank, mobile money or card, recorded online or by finance staff. */
export function PaymentHistory({ payments, pendingId, downloadError, onView, onDownload }: Props) {
  return (
    <Panel padded={false}>
      <div className="border-b border-base-300 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Payment history</h2>
        <p className="text-xs text-muted">Payments made online and payments recorded by the finance office.</p>
      </div>
      {downloadError ? <p role="alert" className="alert alert-error alert-soft m-4 text-sm">{downloadError}</p> : null}
      {payments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">No payments yet. Each payment appears here with its receipt.</p>
      ) : (
        <ul className="divide-y divide-base-300">
          {payments.map(payment => {
            const refund = payment.txnType === 'REFUND';
            const receipt = payment.receipt ?? null;
            return (
              <li key={payment.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold tabular-nums">
                      {refund ? '−' : ''}{currencyAmount(money(payment.amount), payment.currency)}
                    </p>
                    {refund ? <span className="badge badge-sm badge-soft badge-info">Refund</span> : null}
                    {receipt?.voidedAt ? <span className="badge badge-sm badge-soft badge-error">Receipt void</span> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {isoDate(payment.paidAt)} · {payment.method?.name ?? 'Payment'}
                    {payment.reference ? <> · Ref <span className="font-mono">{payment.reference}</span></> : null}
                  </p>
                </div>
                {receipt ? (
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => onView(receipt)} className="btn btn-ghost btn-xs rounded-full border border-base-300">
                      <FiEye aria-hidden />Receipt
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === receipt.id}
                      onClick={() => onDownload(receipt)}
                      aria-label={`Download receipt ${receipt.receiptNumber}`}
                      className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand"
                    >
                      {pendingId === receipt.id ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}PDF
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
