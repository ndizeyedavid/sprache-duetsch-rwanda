import { formatDistanceToNow } from 'date-fns';
import { FiCheck,FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { StaffPaymentClaim } from '../../lib/payment-claims';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { amountLabel,dayLabel } from './utils';

type Props = { claim: StaffPaymentClaim; onApprove: () => void; onReject: () => void };

/** One reported payment with what finance needs to check it, and the two decisions. */
export function ClaimRow({ claim, onApprove, onReject }: Props) {
  const { student } = claim;
  const pending = claim.status === 'PENDING';
  return (
    <li className="grid gap-3 border-t border-line p-4 first:border-t-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center">
      <div className="min-w-0">
        <Link to={`/admin/students/${student.id}?tab=payments`} className="truncate text-sm font-semibold hover:underline">{student.user.firstName} {student.user.lastName}</Link>
        <p className="truncate text-xs text-muted"><span className="font-mono">{student.studentCode}</span>{student.user.phone ? ` · ${student.user.phone}` : ''}</p>
        {student.finance ? <p className="text-[0.6875rem] text-muted">Balance now {amountLabel(student.finance.balance, student.finance.currency)}</p> : null}
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight">{amountLabel(claim.amount, claim.currency)}</p>
        <p className="text-xs text-muted">{claim.method.name} · paid {dayLabel(claim.paidAt)}</p>
      </div>
      <div className="min-w-0 text-xs">
        {claim.reference ? <p>Ref <span className="rounded bg-base-200 px-1.5 py-0.5 font-mono font-semibold">{claim.reference}</span></p> : <p className="text-muted">No reference (cash)</p>}
        {claim.note ? <p className="mt-1 line-clamp-2 italic text-muted">“{claim.note}”</p> : null}
        <p className="mt-1 text-[0.6875rem] text-muted">
          Reported {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
          {claim.reviewedBy ? ` · ${claim.status === 'APPROVED' ? 'confirmed' : 'reviewed'} by ${claim.reviewedBy.firstName}` : ''}
        </p>
        {!pending && claim.reviewNote ? <p className="mt-1 text-[0.6875rem]">{claim.reviewNote}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {pending ? (
          <>
            <button type="button" onClick={onReject} className="btn btn-sm gap-1 rounded-full border-line bg-base-100"><FiX aria-hidden />Reject</button>
            <button type="button" onClick={onApprove} className="btn btn-primary btn-sm gap-1 rounded-full"><FiCheck aria-hidden />Approve</button>
          </>
        ) : (
          <>
            <ClaimStatusBadge status={claim.status} />
            {claim.payment?.receipt ? <span className="font-mono text-[0.6875rem] text-muted">{claim.payment.receipt.receiptNumber}</span> : null}
          </>
        )}
      </div>
    </li>
  );
}
