import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { StudentRow } from '../../lib/services';
import { approveDiscount,humanize,listDiscounts,money,rejectDiscount } from '../../lib/services';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel,SectionHeader } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { AcademicModalAction } from './AcademicModalAction';
import { DiscountRequestForm } from './DiscountRequestForm';

export function DiscountPanel({ students, onApproved }: { students: StudentRow[]; onApproved: () => void }) {
 const discounts = useApi('discounts-pending', () => listDiscounts('PENDING'));
 const [disError, setDisError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [working, setWorking] = useState<string | null>(null);
 const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

 async function handleApprove(id: string) {
 setDisError(null); setSuccess(null); setWorking(id);
 try {
 await approveDiscount(id);
 discounts.refetch(); setSuccess('Discount register updated.');
 onApproved();
 } catch (err) {
 setDisError(apiErrorMessage(err, 'Could not approve the discount.'));
 } finally { setWorking(null); }
 }

 async function handleReject(id: string) {
 const reason = (rejectReason[id] ?? '').trim();
 if (reason.length < 4) {
 setDisError('Give a short reason before rejecting.');
 return;
 }
 setDisError(null); setSuccess(null); setWorking(id);
 try {
 await rejectDiscount(id, reason);
 discounts.refetch(); setSuccess('Discount register updated.');
 } catch (err) {
 setDisError(apiErrorMessage(err, 'Could not reject the discount.'));
 } finally { setWorking(null); }
 }

 return (
<Panel>
 <SectionHeader title="Discounts" />
 <AcademicModalAction label="Request discount" title="Request discount">{done => <DiscountRequestForm students={students} onRequested={() => { discounts.refetch(); done('Discount requested.'); }} />}</AcademicModalAction>

 {disError && <p role="alert" className="mt-3 text-xs text-error">{disError}</p>}{success && <p role="status" className="mt-3 text-xs">{success}</p>}
 <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Pending approval</h3>
 {discounts.loading ? (
 <LoadingBlock label="Loading discounts…" />
 ) : discounts.error ? (
 <ErrorBlock message={discounts.error} onRetry={discounts.refetch} />
 ) : !discounts.data || discounts.data.length === 0 ? (
 <p className="mt-2 text-xs text-muted">No pending discounts.</p>
 ) : (
 <ul className="mt-2 space-y-2">
 {discounts.data.map((discount) => (
 <li key={discount.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
 <span className="flex items-center justify-between gap-2">
 <span className="truncate font-semibold">
 {discount.student.user.firstName} {discount.student.user.lastName} ·{' '}
 {humanize(discount.type)} {money(discount.value)}
 </span>
 <StatusBadge status={humanize(discount.status)} />
 </span>
 <span className="mt-0.5 block text-muted">{discount.reason}</span>
 <span className="mt-2 flex gap-2">
 <button type="button" disabled={working !== null} onClick={() => handleApprove(discount.id)} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content">
 Approve
 </button>
 <input
 value={rejectReason[discount.id] ?? ''}
 onChange={(event) => { const reason = event.currentTarget.value; setRejectReason((current) => ({ ...current, [discount.id]: reason })); }}
 placeholder="Reject reason"
 aria-label={`Reject reason for discount ${discount.id}`}
 className="input input grow rounded-field border-line bg-base-100"
 />
 <button type="button" disabled={working !== null} onClick={() => handleReject(discount.id)} className="btn btn-xs rounded-full border-0 bg-coral text-white hover:bg-coral hover:text-error-content">
 Reject
 </button>
 </span>
 </li>
 ))}
 </ul>
 )}
 </Panel>
 );
}
