import { useMemo,useState } from 'react';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { PaymentRequestHistory } from '../../components/payments/PaymentRequestHistory';
import { PaypackCheckout } from '../../components/payments/PaypackCheckout';
import { usePaypackCheckout } from '../../components/payments/usePaypackCheckout';
import { DueCallout } from '../../components/payments-student/DueCallout';
import { HowToPay } from '../../components/payments-student/HowToPay';
import { PaymentsHero } from '../../components/payments-student/PaymentsHero';
import { ReportPaymentPanel } from '../../components/payments-student/ReportPaymentPanel';
import { PaymentHistory } from '../../components/payments-student/PaymentHistory';
import { PaymentSchedule } from '../../components/payments-student/PaymentSchedule';
import { scheduleRows } from '../../components/payments-student/schedule';
import { useDocumentDownload } from '../../components/profile/useDocumentDownload';
import { ReceiptDocumentDialog } from '../../components/receipts/ReceiptDocumentDialog';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../lib/services/get-my-profile';
import { money } from '../../lib/services/money';
import type { MyPaymentRow } from '../../lib/student-payments';
import { getMyFinanceDetail,listActivePaymentMethods } from '../../lib/student-payments';

type Receipt = NonNullable<MyPaymentRow['receipt']>;

/** Student payments: balance, schedule with due dates, every payment with receipts, and how to pay. */
export function Payments() {
  const finance = useApi('my-finance-detail', getMyFinanceDetail);
  const methods = useApi('active-payment-methods', listActivePaymentMethods);
  const profile = useApi('my-profile', getMyProfile);
  const checkout = usePaypackCheckout(finance.refetch);
  const { pendingId, error: downloadError, download } = useDocumentDownload();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const rows = useMemo(() => scheduleRows(finance.data?.charges ?? []), [finance.data]);

  if (finance.loading) return <div className="space-y-4"><PaymentsHero /><LoadingBlock label="Loading your payments…" /></div>;
  if (finance.error || !finance.data) {
    return <div className="space-y-4"><PaymentsHero /><ErrorBlock message={finance.error ?? 'Could not load your payments.'} onRetry={finance.refetch} /></div>;
  }

  const detail = finance.data;
  const account = detail.finance;
  if (!account) return <div className="space-y-4"><PaymentsHero /><EmptyBlock title="No course fees yet" hint="Your fees and payment schedule appear here once you join a course." /></div>;

  return (
    <div className="space-y-4">
      <PaymentsHero account={account} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <DueCallout account={account} />
        <PaymentSchedule rows={rows} />
      </div>

      <div id="pay" className="grid scroll-mt-24 items-start gap-4 lg:grid-cols-2">
        <Panel>
          <PaypackCheckout balance={Math.max(0, money(account.balance))} currency={account.currency} checkout={checkout} />
          <PaymentRequestHistory rows={checkout.rows} />
        </Panel>
        <Panel>
          {methods.loading ? <p role="status" className="text-sm text-muted">Loading payment options…</p> : null}
          {methods.error ? <ErrorBlock message={methods.error} onRetry={methods.refetch} /> : null}
          {methods.data ? (
            <HowToPay methods={methods.data} studentCode={profile.data?.studentCode ?? null} campusName={profile.data?.campus?.name ?? null} />
          ) : null}
        </Panel>
      </div>

      {methods.data ? (
        <ReportPaymentPanel methods={methods.data} balance={Math.max(0, money(account.balance))} currency={account.currency} onChanged={finance.refetch} />
      ) : null}

      <div id="payment-history" className="scroll-mt-24">
      <PaymentHistory
        payments={detail.payments}
        pendingId={pendingId}
        downloadError={downloadError}
        onView={setReceipt}
        onDownload={(row) => void download(row.id, row.receiptNumber, `/payments/receipts/${row.id}/pdf`)}
      />
      </div>

      {receipt ? <ReceiptDocumentDialog receipt={receipt} onClose={() => setReceipt(null)} /> : null}
    </div>
  );
}
