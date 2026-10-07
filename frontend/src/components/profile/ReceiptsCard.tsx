import { FiDownload } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { ReceiptRow } from '../../lib/services';
import { isoDate,money } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { SectionState } from './SectionState';

type Props = {
  receipts: ReceiptRow[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  pendingId: string | null;
  onDownload: (receipt: ReceiptRow) => void;
};

export function ReceiptsCard({ receipts, loading, error, onRetry, pendingId, onDownload }: Props) {
  const rows = receipts ?? [];

  return (
    <Panel padded={false}>
      <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold">
        Receipts
        {receipts ? <span className="ml-auto text-xs font-normal text-muted">{receipts.length}</span> : null}
      </h2>

      <SectionState
        loading={loading}
        loadingLabel="Loading your receipts…"
        error={error}
        onRetry={onRetry}
        isEmpty={!rows.length}
        emptyTitle="No receipts yet"
        emptyHint="Every payment recorded by the finance office gets a receipt PDF you can download here."
      >
        <ul>
          {rows.map((receipt) => (
            <li
              key={receipt.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{receipt.receiptNumber}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {rwf(money(receipt.payment.amount))} · {receipt.payment.method?.name ?? 'Payment'} ·{' '}
                  {isoDate(receipt.issuedAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={pendingId === receipt.id}
                onClick={() => onDownload(receipt)}
                className="btn btn-outline btn-xs gap-1.5 rounded-full"
              >
                {pendingId === receipt.id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <FiDownload aria-hidden size={12} />
                )}
                Download
              </button>
            </li>
          ))}
        </ul>
      </SectionState>
    </Panel>
  );
}