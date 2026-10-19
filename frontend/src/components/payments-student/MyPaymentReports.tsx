import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { withdrawClaim,type PaymentClaim } from '../../lib/payment-claims';
import { ClaimStatusBadge } from '../payment-claims/ClaimStatusBadge';
import { amountLabel,dayLabel } from '../payment-claims/utils';

/** The student's own reports: what's waiting, what was confirmed (with receipt) and why one was not. */
export function MyPaymentReports({ claims, onChanged }: { claims: PaymentClaim[]; onChanged: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!claims.length) return null;
  async function withdraw(id: string) {
    setBusyId(id); setError(null);
    try { await withdrawClaim(id); onChanged(); } catch (err) { setError(apiErrorMessage(err, 'Could not withdraw this report.')); } finally { setBusyId(null); }
  }
  return (
    <div className="mt-5 border-t border-line pt-4">
      <h3 className="text-sm font-semibold">Your reported payments</h3>
      {error ? <p role="alert" className="mt-1 text-xs text-error">{error}</p> : null}
      <ul className="mt-2 space-y-2">
        {claims.slice(0, 6).map((claim) => (
          <li key={claim.id} className="rounded-box border border-line p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{amountLabel(claim.amount, claim.currency)} · {claim.method.name}</span>
              <ClaimStatusBadge status={claim.status} />
            </div>
            <p className="mt-1 text-muted">Paid {dayLabel(claim.paidAt)}{claim.reference ? <> · ref <span className="font-mono">{claim.reference}</span></> : null}</p>
            {claim.status === 'APPROVED' && claim.payment?.receipt ? <p className="mt-1">Receipt <span className="font-mono font-semibold">{claim.payment.receipt.receiptNumber}</span> — see Payment history below.</p> : null}
            {claim.status === 'REJECTED' && claim.reviewNote ? <p className="mt-1">{claim.reviewNote}</p> : null}
            {claim.status === 'PENDING' ? (
              <button type="button" className="btn btn-ghost btn-xs mt-1 rounded-full" disabled={busyId === claim.id} onClick={() => void withdraw(claim.id)}>Withdraw (made a mistake)</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
