import { FiArrowDown,FiCreditCard,FiFileText } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { humanize } from '../../lib/services/humanize';
import { isoDate } from '../../lib/services/iso-date';
import { money } from '../../lib/services/money';
import type { MyFinanceDetail } from '../../lib/student-payments';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Props = { account?: MyFinanceDetail['finance'] };

/** Payments header: what is left to pay (big, on the right), status chips, and jumps to paying / receipts. */
export function PaymentsHero({ account }: Props) {
  const format = (value: number) => currencyAmount(value, account?.currency ?? 'RWF');
  const balance = account ? Math.max(0, money(account.balance)) : 0;
  const due = account ? money(account.totalDue) : 0;
  const paid = account ? money(account.totalPaid) : 0;
  const share = due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 100;
  const overdue = account ? money(account.overdueAmount) : 0;
  const next = account?.nextDueAt && money(account.nextDueAmount) > 0 ? `${format(money(account.nextDueAmount))} due ${isoDate(account.nextDueAt)}` : null;
  return (
    <PageHero
      eyebrow="Studiengebühren · Tuition"
      icon={FiCreditCard}
      title="Payments"
      description={!account ? 'Your course fees, payment schedule and receipts.'
        : balance > 0 ? <><strong className="font-semibold">{format(balance)} left to pay</strong> · {format(paid)} paid of {format(due)}.</>
          : <>You are all paid up — danke! {format(paid)} paid of {format(due)}.</>}
      art={account ? undefined : 'finance'}
      aside={account ? (
        <div className="flex h-full flex-col justify-center text-primary-content">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">{balance > 0 ? 'Left to pay' : 'Course fees'}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums roomy:text-4xl">{balance > 0 ? format(balance) : 'Paid in full'}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full border border-primary-content" role="progressbar" aria-label="Fees paid" aria-valuenow={share} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary-content" style={{ width: `${share}%` }} />
          </div>
          <p className="mt-2 text-xs tabular-nums">{share}% paid</p>
        </div>
      ) : undefined}
      meta={account ? <>
        <span className="hero-chip hero-chip-solid">{humanize(account.status)}</span>
        {overdue > 0 ? <span className="hero-chip">{format(overdue)} overdue</span> : null}
        {next ? <span className="hero-chip">Next: {next}</span> : null}
      </> : null}
      actions={account ? <>
        {balance > 0 ? <a href="#pay" className={heroAction}><FiArrowDown aria-hidden />Pay now</a> : null}
        <a href="#payment-history" className={balance > 0 ? heroGhost : heroAction}><FiFileText aria-hidden />Receipts</a>
      </> : null}
    />
  );
}
