import { useState } from 'react';
import { FiInbox } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { listClaims,type ClaimStatus,type StaffPaymentClaim } from '../../lib/payment-claims';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { ClaimRow } from './ClaimRow';
import { ReviewClaimDialog } from './ReviewClaimDialog';

const TABS: { value: ClaimStatus; label: string }[] = [
  { value: 'PENDING', label: 'Waiting' }, { value: 'APPROVED', label: 'Confirmed' }, { value: 'REJECTED', label: 'Not confirmed' },
];

type Props = { onChanged: () => void; onMessage: (message: string) => void };

/** Payments students made outside the gateway (bank, MoMo to the school number, cash) waiting to be confirmed. */
export function ApprovalQueue({ onChanged, onMessage }: Props) {
  const [status, setStatus] = useState<ClaimStatus>('PENDING');
  const [page, setPage] = useState(1);
  const claims = useApi(`payment-claims-${status}-${page}`, () => listClaims(status, page));
  const [review, setReview] = useState<{ claim: StaffPaymentClaim; mode: 'approve' | 'reject' } | null>(null);
  const pending = claims.data?.summary.pending ?? 0;

  return (
    <section id="approvals" className="scroll-mt-24 overflow-hidden rounded-box border border-line bg-base-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold"><FiInbox aria-hidden className="text-primary" />Payment approvals
            {pending ? <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-bold text-primary-content">{pending}</span> : null}</h2>
          <p className="text-xs text-muted">Students who paid outside the gateway report it here. Check your statement, then confirm or reject.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-base-200 p-1" role="group" aria-label="Approval status">
          {TABS.map((tab) => (
            <button key={tab.value} type="button" aria-pressed={status === tab.value} onClick={() => { setStatus(tab.value); setPage(1); }}
              className={`btn btn-xs h-7 rounded-full border-0 px-3 ${status === tab.value ? 'btn-primary' : 'btn-ghost'}`}>{tab.label}</button>
          ))}
        </div>
      </div>
      {claims.loading ? <div className="p-6"><LoadingBlock label="Loading payment reports…" /></div>
        : claims.error ? <div className="p-4"><ErrorBlock message={claims.error} onRetry={claims.refetch} /></div>
          : !claims.data?.data.length ? <div className="p-6"><EmptyBlock title={status === 'PENDING' ? 'Nothing waiting' : 'No reports here yet'} hint={status === 'PENDING' ? 'New student payment reports appear here — you also get a notification.' : 'Reviewed reports are listed here for reference.'} /></div>
            : <ul>{claims.data.data.map((claim) => <ClaimRow key={claim.id} claim={claim} onApprove={() => setReview({ claim, mode: 'approve' })} onReject={() => setReview({ claim, mode: 'reject' })} />)}</ul>}
      {claims.data && claims.data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 border-t border-line p-3 text-xs">
          <button type="button" className="btn btn-xs rounded-full" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {claims.data.meta.totalPages}</span>
          <button type="button" className="btn btn-xs rounded-full" disabled={page >= claims.data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      ) : null}
      <ReviewClaimDialog key={review?.claim.id ?? 'none'} claim={review?.claim ?? null} mode={review?.mode ?? 'approve'} onClose={() => setReview(null)}
        onDone={(message) => { setReview(null); claims.refetch(); onChanged(); onMessage(message); }} />
    </section>
  );
}
