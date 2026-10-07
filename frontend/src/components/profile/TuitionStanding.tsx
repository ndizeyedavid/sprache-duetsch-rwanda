import { FiArrowRight } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { MyProfile } from '../../lib/services';
import { humanize,money } from '../../lib/services';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { moneySummary } from './utils';

type Props = { finance: MyProfile['finance']; onOpenPayments: () => void };

/** Tuition lives next to attendance on purpose: academic and financial standing
 *  stay separate fields, but a student needs to read them together. */
export function TuitionStanding({ finance, onOpenPayments }: Props) {
  const summary = moneySummary(finance);
  const format = (amount: number) => currencyAmount(amount, finance?.currency ?? 'RWF');

  return (
    <section className="card items-start gap-4 border border-line bg-base-100 p-5">
      <div className="flex w-full items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Tuition standing</h2>
        {finance ? <StatusBadge status={humanize(finance.status)} /> : <StatusBadge status="No charges" />}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{format(summary.balance)}</p>
        <p className="text-xs text-muted">{summary.balance > 0 ? 'left to pay' : 'outstanding'}</p>
      </div>

      {finance ? (
        <>
          <ProgressBar value={summary.paidShare} />
          <p className="text-xs leading-5 text-muted">
            {format(summary.paid)} paid of {format(summary.due)} due
            {summary.balance <= 0 && summary.due > 0 ? ' — you are fully paid.' : '.'}
          </p>
        </>
      ) : (
        <p className="text-xs leading-5 text-muted">
          No tuition charges yet. Charges appear once an academic admin enrols you and sets your fee.
        </p>
      )}

      <button
        type="button"
        onClick={onOpenPayments}
        className="flex w-full items-center justify-between rounded-box bg-base-200 px-4 py-3 text-left text-xs font-semibold"
      >
        {finance && money(finance.balance) > 0 ? 'Settle your balance' : 'View payment history'}
        <FiArrowRight aria-hidden className="text-brand" />
      </button>
    </section>
  );
}
