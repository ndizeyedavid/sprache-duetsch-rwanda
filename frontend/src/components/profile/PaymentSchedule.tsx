import { ManualPaymentInstructions } from './ManualPaymentInstructions';
import type { MyFinance } from '../../lib/services';
import { money } from '../../lib/services';

export function PaymentSchedule({ finance }: { finance: MyFinance | null }) {
  const account = finance?.finance;
  if (!account) return null;
  const format = (value: string | number | undefined) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: account.currency }).format(money(value ?? 0));
  return <section className="card gap-3 border border-base-300 p-4">
    <h3 className="text-sm font-semibold">Payment dates</h3>
    <p className={money(account.overdueAmount ?? 0) > 0 ? 'text-sm text-error' : 'text-sm'}>Overdue now: {format(account.overdueAmount)}</p>
    {account.nextDueAt ? <p className="text-sm">Next payment: {format(account.nextDueAmount)} by {new Date(account.nextDueAt).toLocaleDateString()}</p> : <p className="text-sm text-base-content/60">No upcoming instalment.</p>}
    <ul className="space-y-2">{finance.charges.filter(row => row.dueDate).map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 text-xs"><span>{row.description ?? row.type}</span><span>{format(row.outstanding ?? row.amount)} remaining · {new Date(row.dueDate!).toLocaleDateString()} · {row.obligationStatus?.replaceAll("_", " ").toLowerCase()}</span></li>)}</ul>
    <ManualPaymentInstructions />
  </section>;
}
