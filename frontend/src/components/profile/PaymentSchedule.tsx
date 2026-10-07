import { FiCalendar } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { MyFinance } from '../../lib/services';
import { money } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { ManualPaymentInstructions } from './ManualPaymentInstructions';

export function PaymentSchedule({ finance }: { finance: MyFinance | null }) {
  const account = finance?.finance;
  if (!account) return null;
  const format = (value: string | number | undefined) => currencyAmount(money(value ?? 0), account.currency);
  const overdue = money(account.overdueAmount ?? 0);
  const charges = finance.charges.filter(row => row.dueDate);
  return <Panel>
    <h2 className="flex items-center gap-2 text-base font-semibold"><FiCalendar className="text-base-content/60" aria-hidden />Payment dates</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className={`rounded-box border p-4 ${overdue > 0 ? 'border-error/20 bg-error/5' : 'border-base-300 bg-base-200/30'}`}>
        <p className="text-xs text-base-content/60">Overdue balance</p><p className={`mt-2 text-xl font-semibold tabular-nums ${overdue > 0 ? 'text-error' : ''}`}>{format(account.overdueAmount)}</p>
        <p className="mt-1 text-xs text-base-content/60">{overdue > 0 ? 'Pay an instalment above or contact finance.' : 'You have no overdue payments.'}</p>
      </div>
      <div className="rounded-box border border-base-300 bg-base-200/30 p-4">
        <p className="text-xs text-base-content/60">Next payment</p><p className="mt-2 text-xl font-semibold tabular-nums">{account.nextDueAt ? format(account.nextDueAmount) : 'No upcoming payment'}</p>
        <p className="mt-1 text-xs text-base-content/60">{account.nextDueAt ? `Due ${new Date(account.nextDueAt).toLocaleDateString()}` : 'Any remaining balance is shown above.'}</p>
      </div>
    </div>
    {charges.length ? <details className="mt-4 border-t border-base-300 pt-4 text-sm">
      <summary className="cursor-pointer font-medium">View payment schedule</summary>
      <ul className="mt-3 divide-y divide-base-300">{charges.map(row => <li key={row.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm">{row.description ?? row.type}</span><span className="text-xs text-base-content/60">{format(row.outstanding ?? row.amount)} remaining · {new Date(row.dueDate!).toLocaleDateString()}</span>
      </li>)}</ul>
    </details> : null}
    <details className="mt-4 border-t border-base-300 pt-4 text-sm"><summary className="cursor-pointer font-medium">Other ways to pay</summary><div className="mt-4"><ManualPaymentInstructions /></div></details>
  </Panel>;
}
