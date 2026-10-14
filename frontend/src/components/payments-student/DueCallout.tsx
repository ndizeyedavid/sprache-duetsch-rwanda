import { FiAlertTriangle,FiCalendar,FiCheckCircle } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { humanize } from '../../lib/services/humanize';
import { isoDate } from '../../lib/services/iso-date';
import { money } from '../../lib/services/money';
import type { MyFinanceDetail } from '../../lib/student-payments';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { dueInWords } from './schedule';

type Props = { account: NonNullable<MyFinanceDetail['finance']> };

/** What needs attention now: overdue money first, then the next due date, then good news. */
export function DueCallout({ account }: Props) {
  const format = (value: number) => currencyAmount(value, account.currency);
  const overdue = money(account.overdueAmount);
  const nextAmount = money(account.nextDueAmount);
  const discount = money(account.totalDiscount);
  const settled = money(account.balance) <= 0;

  return (
    <Panel className="gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Payment status</h2>
        <StatusBadge status={humanize(account.status)} />
      </div>

      {overdue > 0 ? (
        <div role="alert" className="alert alert-error alert-soft items-start">
          <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-lg" />
          <div>
            <p className="font-semibold tabular-nums">{format(overdue)} overdue</p>
            <p className="text-xs">Please pay it as soon as you can, or talk to the finance office about a plan.</p>
          </div>
        </div>
      ) : null}

      {account.nextDueAt && nextAmount > 0 ? (
        <div className="flex items-start gap-3 rounded-box bg-base-200 p-4">
          <FiCalendar aria-hidden className="mt-0.5 shrink-0 text-lg text-brand" />
          <div>
            <p className="text-xs text-muted">Next payment</p>
            <p className="text-xl font-semibold tabular-nums">{format(nextAmount)}</p>
            <p className="text-xs text-muted">{isoDate(account.nextDueAt)} · {dueInWords(account.nextDueAt)}</p>
          </div>
        </div>
      ) : null}

      {settled ? (
        <div className="flex items-start gap-3 rounded-box bg-base-200 p-4">
          <FiCheckCircle aria-hidden className="mt-0.5 shrink-0 text-lg text-success" />
          <p className="text-sm">You are all paid up. Your receipts are in the history below.</p>
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div><dt className="text-muted">Total fees</dt><dd className="font-semibold tabular-nums">{format(money(account.totalDue))}</dd></div>
        <div><dt className="text-muted">Paid so far</dt><dd className="font-semibold tabular-nums">{format(money(account.totalPaid))}</dd></div>
        {discount > 0 ? <div><dt className="text-muted">Discounts</dt><dd className="font-semibold tabular-nums">{format(discount)}</dd></div> : null}
        {account.lastPaymentAt ? <div><dt className="text-muted">Last payment</dt><dd className="font-semibold">{isoDate(account.lastPaymentAt)}</dd></div> : null}
      </dl>
    </Panel>
  );
}
