import { PaymentManageDialog } from './PaymentManageDialog';
import { ReceiptDocumentDialog } from '../receipts/ReceiptDocumentDialog';
import { useState } from 'react';
import { FiDownload,FiSearch } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import { apiErrorMessage,apiPost,downloadFile } from '../../lib/api';
import { currencyAmount } from '../../lib/format';
import type { PaymentRow } from '../../lib/services';
import { isoDate,money } from '../../lib/services';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel,SectionHeader } from '../ui/Panel';

export function PaymentLedger({ payments, onChanged }: { payments: ApiState<PaymentRow[]>; onChanged: () => void }) {
 const [selected, setSelected] = useState<PaymentRow | null>(null);
 const [receipt, setReceipt] = useState<NonNullable<PaymentRow['receipt']> | null>(null);
 const [query, setQuery] = useState('');
 const needle = query.trim().toLowerCase();
 const visible = (payments.data ?? []).filter(p => `${p.student.user.firstName} ${p.student.user.lastName} ${p.student.studentCode} ${p.reference ?? ''} ${p.method?.name ?? ''}`.toLowerCase().includes(needle));
 const [exportError, setExportError] = useState<string | null>(null);
 const [exporting, setExporting] = useState(false);
 const [reminderNote, setReminderNote] = useState<string | null>(null);

 async function handleExport() {
 setExportError(null);
 setExporting(true);
 try {
 await downloadFile('/payments/export?pageSize=100', 'payments.csv'); setReminderNote('Payments CSV downloaded.');
 } catch (err) {
 setExportError(apiErrorMessage(err, 'Could not export payments.'));
 } finally {
 setExporting(false);
 }
 }

 async function handleReminders() {
 setExportError(null);
 setReminderNote(null);
 setExporting(true);
 try {
 const result = await apiPost<{ sent: number }>('/payments/reminders/run', { overdueOnly: true });
 setReminderNote(`Queued ${result.sent} overdue reminders. Check email delivery for provider status.`);
 } catch (err) {
 setExportError(apiErrorMessage(err, 'Could not run reminders.'));
 } finally {
 setExporting(false);
 }
 }

 return (
<Panel>
 <SectionHeader title="Latest payments" />
 <div className="mb-3 flex flex-wrap items-center gap-2">
 <button
 type="button"
 disabled={exporting}
 onClick={handleExport}
 className="btn btn-sm gap-2 rounded-full border-line bg-base-200 disabled:opacity-60"
 >
 <FiDownload aria-hidden />
 Export CSV
 </button>
 <button
 type="button"
 disabled={exporting}
 onClick={handleReminders}
 className="btn btn-sm gap-2 rounded-full border-0 bg-sun text-ink hover:bg-sun hover:text-warning-content disabled:opacity-60"
 >
 Run overdue reminders
 </button>
 {exportError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {exportError}
 </p>
 ) : null}
 {reminderNote ? <p role="status" className="text-xs font-medium">{reminderNote}</p> : null}
 </div>
 <label className="input mb-4 flex w-full items-center gap-2"><FiSearch aria-hidden /><input aria-label="Search payments" className="min-w-0 grow" placeholder="Search student, reference, or method…" value={query} onChange={e => setQuery(e.target.value)} /></label>
 {payments.loading ? (
 <LoadingBlock label="Loading payments…" />
 ) : payments.error || !payments.data ? (
 <ErrorBlock
 message={payments.error ?? 'Could not load payments.'}
 onRetry={payments.refetch}
 />
 ) : visible.length === 0 ? (
 <EmptyBlock title={payments.data.length ? "No matching payments" : "No payments yet"} hint="Search by learner or reference, or record a payment above." />
 ) : (
 <div className="overflow-x-auto">
 <table className="table w-full text-xs">
 <thead>
 <tr className="text-muted">
 <th className="text-left">Student</th>
 <th className="text-left">Amount</th>
 <th className="text-left">Method</th>
 <th className="text-left">Reference</th>
 <th className="text-left">Paid</th>
 <th className="text-left">Receipt</th><th className="text-left">Actions</th>
 </tr>
 </thead>
 <tbody>
 {visible.map((payment) => (
 <tr key={payment.id} className="border-t border-line">
 <td className="py-3 pr-4">
 <p className="font-semibold">
 {payment.student.user.firstName} {payment.student.user.lastName}
 </p>
 <p className="text-muted">{payment.student.studentCode}</p>
 </td>
 <td className="py-3 pr-4 font-semibold">
 {currencyAmount(money(payment.amount) * (payment.txnType === "REFUND" ? -1 : 1), payment.currency)}
 {payment.txnType === "REFUND" ? <span className="block text-muted">Refund</span> : null}
 </td>
 <td className="py-3 pr-4">{payment.method?.name ?? '—'}</td>
 <td className="py-3 pr-4">{payment.reference ?? '—'}</td>
 <td className="py-3 pr-4">{isoDate(payment.paidAt)}</td>
 <td className="py-3">
 {payment.receipt ? (
 <button
 type="button"
 onClick={() => setReceipt(payment.receipt!)}
 className="font-semibold text-brand hover:underline"
 >
 {payment.receipt.receiptNumber}{payment.receipt.voidedAt ? " · VOID" : ""}
 </button>
 ) : (
 '—'
 )}
 </td>
 <td>{payment.txnType !== "REFUND" && !payment.receipt?.voidedAt ? <button type="button" className="btn btn-xs" onClick={() => setSelected(payment)}>Manage</button> : null}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 {receipt ? <ReceiptDocumentDialog receipt={receipt} onClose={() => setReceipt(null)} /> : null}
 {selected ? <PaymentManageDialog key={selected.id} payment={selected} onClose={() => setSelected(null)} onSaved={onChanged} /> : null}
 </Panel>
 );
}
