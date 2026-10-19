import { currencyAmount } from '../../../lib/format';
import type { BalanceInfo } from './quick-pay';

/** Balance left, a paid-vs-due bar and an overdue / paid flag for the students table. */
export function StudentBalanceCell({ info }: { info: BalanceInfo }) {
  const share = info.due > 0 ? Math.min(100, Math.round((info.paid / info.due) * 100)) : 100;
  if (info.balance <= 0) {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[0.6875rem] font-semibold text-success-content">Fully paid</span>;
  }
  return (
    <div className="min-w-36">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-sm font-semibold tabular-nums ${info.overdue > 0 ? 'text-error' : ''}`}>{currencyAmount(info.balance, info.currency)}</span>
        {info.overdue > 0 ? <span className="rounded-full bg-error px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase text-error-content">Overdue</span> : null}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-base-200" aria-label={`${share}% paid`}>
        <span className="block h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
      </div>
      <p className="mt-0.5 text-[0.625rem] text-muted">{currencyAmount(info.paid, info.currency)} of {currencyAmount(info.due, info.currency)} paid</p>
    </div>
  );
}
