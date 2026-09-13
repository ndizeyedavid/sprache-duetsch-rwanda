import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, apiPost, downloadFile } from '../../lib/api';
import { rwf } from '../../lib/format';
import {
  approveDiscount,
  createDiscount,
  getFinanceReportSummary,
  humanize,
  isoDate,
  listDiscounts,
  listPaymentMethods,
  listPayments,
  listStudents,
  money,
  recordPayment,
  rejectDiscount,
} from '../../lib/services';
import { FiDollarSign, FiDownload, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

export function AdminTransactions() {
  const summary = useApi('finance-summary', getFinanceReportSummary);
  const payments = useApi('payments-list', listPayments);
  const methods = useApi('payment-methods', listPaymentMethods);
  const students = useApi('finance-students', listStudents);
  const discounts = useApi('discounts-pending', () => listDiscounts('PENDING'));
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reminderNote, setReminderNote] = useState<string | null>(null);

  const [payStudent, setPayStudent] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [payReference, setPayReference] = useState('');
  const [payError, setPayError] = useState<string | null>(null);
  const [paySaving, setPaySaving] = useState(false);

  const [disStudent, setDisStudent] = useState('');
  const [disType, setDisType] = useState('FIXED');
  const [disValue, setDisValue] = useState('');
  const [disReason, setDisReason] = useState('');
  const [disError, setDisError] = useState<string | null>(null);
  const [disSaving, setDisSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  async function handleRecordPayment(event: FormEvent) {
    event.preventDefault();
    setPayError(null);
    setPaySaving(true);
    try {
      await recordPayment({
        studentId: payStudent,
        methodId: payMethod,
        amount: Number(payAmount),
        reference: payReference.trim() || undefined,
      });
      setPayAmount('');
      setPayReference('');
      payments.refetch();
      summary.refetch();
    } catch (err) {
      setPayError(apiErrorMessage(err, 'Could not record the payment.'));
    } finally {
      setPaySaving(false);
    }
  }

  async function handleCreateDiscount(event: FormEvent) {
    event.preventDefault();
    setDisError(null);
    setDisSaving(true);
    try {
      await createDiscount({
        studentId: disStudent,
        type: disType,
        value: Number(disValue),
        reason: disReason.trim(),
      });
      setDisValue('');
      setDisReason('');
      discounts.refetch();
    } catch (err) {
      setDisError(apiErrorMessage(err, 'Could not create the discount.'));
    } finally {
      setDisSaving(false);
    }
  }

  async function handleApprove(id: string) {
    setDisError(null);
    try {
      await approveDiscount(id);
      discounts.refetch();
      summary.refetch();
    } catch (err) {
      setDisError(apiErrorMessage(err, 'Could not approve the discount.'));
    }
  }

  async function handleReject(id: string) {
    const reason = (rejectReason[id] ?? '').trim();
    if (reason.length < 4) {
      setDisError('Give a short reason before rejecting.');
      return;
    }
    setDisError(null);
    try {
      await rejectDiscount(id, reason);
      discounts.refetch();
    } catch (err) {
      setDisError(apiErrorMessage(err, 'Could not reject the discount.'));
    }
  }

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadFile('/payments/export?pageSize=100', 'payments.csv');
    } catch (err) {
      setExportError(apiErrorMessage(err, 'Could not export payments.'));
    } finally {
      setExporting(false);
    }
  }

  async function handleReceipt(id: string, number: string) {
    setExportError(null);
    try {
      await downloadFile(`/payments/receipts/${id}/pdf`, `${number}.pdf`);
    } catch (err) {
      setExportError(apiErrorMessage(err, 'Could not download the receipt.'));
    }
  }

  async function handleReminders() {
    setExportError(null);
    setReminderNote(null);
    setExporting(true);
    try {
      const result = await apiPost<{ sent: number }>('/payments/reminders/run', { overdueOnly: true });
      setReminderNote(`Sent ${result.sent} overdue reminders.`);
    } catch (err) {
      setExportError(apiErrorMessage(err, 'Could not run reminders.'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeader title="Finance overview" />
        {summary.loading ? (
          <LoadingBlock label="Loading finance…" />
        ) : summary.error || !summary.data ? (
          <ErrorBlock
            message={`Finance reports need a finance role. ${summary.error ?? ''}`.trim()}
            onRetry={summary.refetch}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Billed" value={rwf(money(summary.data.totalBilled))} tone="navy" icon={FiDollarSign} />
              <StatTile label="Collected" value={rwf(money(summary.data.totalCollected))} tone="brand" icon={FiTrendingUp} />
              <StatTile label="Outstanding" value={rwf(money(summary.data.totalOutstanding))} tone="coral" icon={FiTrendingDown} />
            </div>
            <p className="mt-3 text-xs text-muted">Collection rate · {summary.data.collectionRate}%</p>
          </>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <SectionHeader title="Record a payment" />
          <form onSubmit={handleRecordPayment} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Student</span>
              <select required value={payStudent} onChange={(event) => setPayStudent(event.target.value)} className="select w-full rounded-field border-line bg-base-200">
                <option value="">Choose…</option>
                {(students.data ?? []).map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.user.firstName} {row.user.lastName} ({row.studentCode})
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Amount (RWF)</span>
                <input required value={payAmount} onChange={(event) => setPayAmount(event.target.value)} inputMode="numeric" placeholder="25000" className="input input-sm w-full rounded-field border-line bg-base-200" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Method</span>
                <select required value={payMethod} onChange={(event) => setPayMethod(event.target.value)} className="select w-full rounded-field border-line bg-base-200">
                  <option value="">Choose…</option>
                  {(methods.data ?? []).map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <input value={payReference} onChange={(event) => setPayReference(event.target.value)} placeholder="Transaction reference (optional)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            {payError ? (
              <p role="alert" className="text-xs font-medium text-error">
                {payError}
              </p>
            ) : null}
            <button type="submit" disabled={paySaving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
              Record payment
            </button>
          </form>
        </Panel>

        <Panel>
          <SectionHeader title="Discounts" />
          <form onSubmit={handleCreateDiscount} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <select required value={disStudent} onChange={(event) => setDisStudent(event.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Discount student">
                <option value="">Student…</option>
                {(students.data ?? []).map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.user.firstName} {row.user.lastName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select value={disType} onChange={(event) => setDisType(event.target.value)} className="select grow rounded-field border-line bg-base-200" aria-label="Discount type">
                  <option value="FIXED">Fixed RWF</option>
                  <option value="PERCENTAGE">Percent %</option>
                </select>
                <input required value={disValue} onChange={(event) => setDisValue(event.target.value)} inputMode="numeric" placeholder="Value" aria-label="Discount value" className="input input-sm w-28 rounded-field border-line bg-base-200" />
              </div>
            </div>
            <input required value={disReason} onChange={(event) => setDisReason(event.target.value)} placeholder="Reason (required)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            {disError ? (
              <p role="alert" className="text-xs font-medium text-error">
                {disError}
              </p>
            ) : null}
            <button type="submit" disabled={disSaving} className="btn btn-sm rounded-full border-0 bg-sun text-ink hover:bg-sun/90 disabled:opacity-60">
              Request discount
            </button>
          </form>

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
                    <button type="button" onClick={() => handleApprove(discount.id)} className="btn btn-xs rounded-full border-0 bg-brand text-white hover:bg-brand/90">
                      Approve
                    </button>
                    <input
                      value={rejectReason[discount.id] ?? ''}
                      onChange={(event) => setRejectReason((current) => ({ ...current, [discount.id]: event.target.value }))}
                      placeholder="Reject reason"
                      aria-label={`Reject reason for discount ${discount.id}`}
                      className="input input-xs grow rounded-field border-line bg-base-100"
                    />
                    <button type="button" onClick={() => handleReject(discount.id)} className="btn btn-xs rounded-full border-0 bg-coral text-white hover:bg-coral/90">
                      Reject
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <SectionHeader title="Latest payments" />
        <div className="mb-3 flex items-center gap-2">
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
            className="btn btn-sm gap-2 rounded-full border-0 bg-sun text-ink hover:bg-sun/90 disabled:opacity-60"
          >
            Run overdue reminders
          </button>
          {exportError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {exportError}
            </p>
          ) : null}
          {reminderNote ? <p className="text-xs font-medium text-brand">{reminderNote}</p> : null}
        </div>
        {payments.loading ? (
          <LoadingBlock label="Loading payments…" />
        ) : payments.error || !payments.data ? (
          <ErrorBlock
            message={`Payments need a finance role. ${payments.error ?? ''}`.trim()}
            onRetry={payments.refetch}
          />
        ) : payments.data.length === 0 ? (
          <EmptyBlock title="No payments yet" hint="Recorded payments will appear here." />
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
                  <th className="text-left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.slice(0, 30).map((payment) => (
                  <tr key={payment.id} className="border-t border-line">
                    <td className="py-3 pr-4">
                      <p className="font-semibold">
                        {payment.student.user.firstName} {payment.student.user.lastName}
                      </p>
                      <p className="text-muted">{payment.student.studentCode}</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {rwf(money(payment.amount))} {payment.currency}
                    </td>
                    <td className="py-3 pr-4">{payment.method?.name ?? '—'}</td>
                    <td className="py-3 pr-4">{payment.reference ?? '—'}</td>
                    <td className="py-3 pr-4">{isoDate(payment.paidAt)}</td>
                    <td className="py-3">
                      {payment.receipt ? (
                        <button
                          type="button"
                          onClick={() => handleReceipt(payment.receipt!.id, payment.receipt!.receiptNumber)}
                          className="font-semibold text-brand hover:underline"
                        >
                          {payment.receipt.receiptNumber}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
