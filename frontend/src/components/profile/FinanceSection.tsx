import { FiDollarSign,FiFileText,FiTrendingDown } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { MyFinance } from '../../lib/services';
import { humanize,money } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { PaypackCheckout } from '../payments/PaypackCheckout';
import { LEDGER_LIMIT } from './constants';
import { LedgerList } from './LedgerList';
import { PaymentSchedule } from './PaymentSchedule';
import { SectionState } from './SectionState';
import { chargeRows,moneySummary,paymentRows } from './utils';

type Props = { finance: MyFinance | null; loading: boolean; error: string | null; onRetry: () => void };

export function FinanceSection({ finance, loading, error, onRetry }: Props) {
  const account = finance?.finance ?? null;
  const summary = moneySummary(account);
  const format = (amount: number) => currencyAmount(amount, account?.currency ?? 'RWF');
  const charges = finance ? chargeRows(finance).slice(0, LEDGER_LIMIT) : [];
  const payments = finance ? paymentRows(finance).slice(0, LEDGER_LIMIT) : [];
  const discount = (finance?.discounts ?? [])
    .filter((entry) => entry.status === 'APPROVED' && entry.amount)
    .reduce((sum, entry) => sum + money(entry.amount), 0);

  return (
    <SectionState
      loading={loading}
      loadingLabel="Loading your tuition…"
      error={error}
      onRetry={onRetry}
      isEmpty={!account}
      emptyTitle="No tuition charges yet"
      emptyHint="Charges appear once an academic admin enrols you and sets your fee."
    >
      <div className="space-y-4">
        <PaypackCheckout balance={summary.balance} currency={account?.currency ?? 'RWF'} onPaid={onRetry} />
        <PaymentSchedule finance={finance} />
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Tuition summary</h2>
            {account ? <StatusBadge status={humanize(account.status)} /> : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-box bg-night p-4 text-white">
              <p className="text-xs text-base-200">Balance</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{format(summary.balance)}</p>
              <p className="mt-1 text-xs text-base-200">
                {summary.balance > 0 ? 'still to pay' : 'nothing outstanding'}
              </p>
            </div>
            <div className="rounded-box bg-base-200 p-4">
              <p className="text-xs text-muted">Total due</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{format(summary.due)}</p>
              <p className="mt-1 text-xs text-muted">across your enrolments</p>
            </div>
            <div className="rounded-box bg-base-200 p-4">
              <p className="text-xs text-muted">Total paid</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-brand">{format(summary.paid)}</p>
              <p className="mt-1 text-xs text-muted tabular-nums">{summary.paidShare}% settled</p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={summary.paidShare} />
          </div>

          {discount > 0 ? (
            <p className="mt-3 text-xs leading-5 text-muted">
              Approved discounts applied: <strong className="font-semibold text-ink">{format(discount)}</strong>.
            </p>
          ) : null}
        </Panel>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Panel padded={false}>
            <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold">
              <FiFileText aria-hidden className="text-brand" />Charges
              {finance ? <span className="ml-auto text-xs font-normal text-muted">{finance.charges.length}</span> : null}
            </h2>
            <LedgerList rows={charges} total={finance?.charges.length ?? 0} emptyLabel="No charges on your account." />
          </Panel>

          <Panel padded={false}>
            <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold">
              <FiTrendingDown aria-hidden className="text-brand" />Payments
              {finance ? <span className="ml-auto text-xs font-normal text-muted">{finance.payments.length}</span> : null}
            </h2>
            <LedgerList
              rows={payments}
              total={finance?.payments.length ?? 0}
              emptyLabel="No payments recorded yet."
              tone="brand"
            />
          </Panel>
        </div>

        <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted">
          <FiDollarSign aria-hidden className="mt-0.5 shrink-0" />
          Confirmed payments update your balance automatically. Download a receipt from Documents for every payment.
        </p>
      </div>
    </SectionState>
  );
}
