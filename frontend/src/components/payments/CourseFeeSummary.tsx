import { currencyAmount } from '../../lib/format';
import type { MyFinance } from '../../lib/services';
import { money } from '../../lib/services';

type Props = { finance: MyFinance };

/** What the student still owes for their course, in plain numbers. */
export function CourseFeeSummary({ finance }: Props) {
  const account = finance.finance!;
  const format = (value: number) => currencyAmount(value, account.currency);
  const due = money(account.totalDue);
  const paid = money(account.totalPaid);
  const balance = Math.max(0, money(account.balance));
  const share = due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 100;
  const open = finance.charges.filter(row => money(row.outstanding ?? row.amount) > 0);
  const courses = open.filter(row => row.type === 'TUITION');
  const extras = open.filter(row => row.type !== 'TUITION').reduce((sum, row) => sum + money(row.outstanding ?? row.amount), 0);

  return (
    <div className="flex flex-col rounded-box bg-brand p-6 text-white sm:p-7">
      <p className="text-sm text-white">{balance > 0 ? 'Left to pay' : 'Course fees'}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{balance > 0 ? format(balance) : 'Paid in full'}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Fees paid" aria-valuenow={share} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${share}%` }} />
      </div>
      <p className="mt-2 text-xs text-white tabular-nums">{format(paid)} paid of {format(due)}</p>

      {courses.length ? (
        <ul className="mt-6 space-y-3 border-t border-white pt-5">
          {courses.map(row => (
            <li key={row.id} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 text-white">{(row.description ?? 'Course tuition').replace(/^Tuition\s*[—-]\s*/i, '')}</span>
              <span className="shrink-0 font-semibold tabular-nums">{format(money(row.outstanding ?? row.amount))}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {extras > 0 ? <p className="mt-3 text-xs text-white">Includes {format(extras)} for registration and books.</p> : null}
    </div>
  );
}
