import { FiDownload, FiEye } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { ReceiptRow } from '../../lib/services';
import { money } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { SectionState } from './SectionState';

type Props = {
  receipts: ReceiptRow[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  pendingId: string | null;
  onPreview: (receipt: ReceiptRow) => void;
  onDownload: (receipt: ReceiptRow) => void;
};

const day = (value: string) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Every payment's receipt: amount first, then number, date and method, with view and download. */
export function ReceiptsCard({ receipts, loading, error, onRetry, pendingId, onPreview, onDownload }: Props) {
  const rows = receipts ?? [];
  return (
    <Panel padded={false}>
      <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold">
        Receipts
        {receipts ? <span className="ml-auto text-xs font-normal text-muted">{receipts.length}</span> : null}
      </h2>
      <SectionState loading={loading} loadingLabel="Loading your receipts…" error={error} onRetry={onRetry}
        isEmpty={!rows.length} emptyTitle="No receipts yet" emptyHint="Each confirmed payment gets a receipt here.">
        <ul className="divide-y divide-line">
          {rows.map(receipt => (
            <li key={receipt.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tabular-nums">{currencyAmount(money(receipt.payment.amount), receipt.payment.currency)}</p>
                  <span className={`badge badge-sm badge-soft ${receipt.voidedAt ? 'badge-error' : 'badge-success'}`}>{receipt.voidedAt ? 'Void' : 'Paid'}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  <span className="font-mono">{receipt.receiptNumber}</span> · {day(receipt.payment.paidAt)} · {receipt.payment.method?.name ?? 'Payment'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onPreview(receipt)} className="btn btn-ghost btn-sm rounded-full border border-line"><FiEye aria-hidden />View</button>
                <button type="button" disabled={pendingId === receipt.id} onClick={() => onDownload(receipt)} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">
                  {pendingId === receipt.id ? <span className="loading loading-spinner loading-xs" /> : <FiDownload aria-hidden />}PDF
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionState>
    </Panel>
  );
}
