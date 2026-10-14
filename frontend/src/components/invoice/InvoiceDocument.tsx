import { currencyAmount } from '../../lib/format';
import type { PublicInvoice } from '../../lib/invoice';
import { money } from '../../lib/services/money';
import { shortDate } from './constants';
import { InvoiceLines } from './InvoiceLines';

type Props = { invoice: PublicInvoice };

/** The invoice itself: who is billed, each charge, and the totals that lead to the balance due. */
export function InvoiceDocument({ invoice }: Props) {
  const summary = invoice.summary;
  const currency = summary?.currency ?? 'RWF';
  const format = (value: number) => currencyAmount(value, currency);
  const balance = Math.max(0, money(summary?.balance));
  const overdue = money(summary?.overdueAmount);
  const discount = money(summary?.totalDiscount);
  const totals: [string, string][] = [
    ['Total fees', format(money(summary?.totalDue))],
    ...(discount > 0 ? [['Discounts', `− ${format(discount)}`] as [string, string]] : []),
    ['Paid so far', format(money(summary?.totalPaid))],
  ];

  return (
    <article className="overflow-hidden rounded-box border border-base-300 bg-base-100">
      <header className="flex flex-wrap items-start justify-between gap-4 bg-brand p-6 text-white sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">Invoice</p>
          <p className="mt-1 font-mono text-sm">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">{balance > 0 ? 'Balance due' : 'Status'}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{balance > 0 ? format(balance) : 'Paid in full'}</p>
        </div>
      </header>

      <div className="grid gap-4 border-b border-base-300 p-6 text-sm sm:grid-cols-2 sm:p-7">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Billed to</p>
          <p className="mt-1 font-semibold">{invoice.student.name}</p>
          <p className="text-muted">{invoice.student.studentCode}{invoice.student.campus ? ` · ${invoice.student.campus}` : ''}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Issued</p>
          <p className="mt-1 font-semibold">{shortDate(invoice.issuedAt)}</p>
          {summary?.nextDueAt && balance > 0 ? <p className="text-muted">Next payment due {shortDate(summary.nextDueAt)}</p> : null}
        </div>
      </div>

      <div className="px-6 sm:px-7"><InvoiceLines lines={invoice.lines} currency={currency} /></div>

      <dl className="space-y-2 border-t border-base-300 bg-base-200 p-6 text-sm sm:p-7">
        {totals.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4"><dt className="text-muted">{label}</dt><dd className="tabular-nums">{value}</dd></div>
        ))}
        {overdue > 0 ? <div className="flex justify-between gap-4 font-semibold text-error"><dt>Overdue now</dt><dd className="tabular-nums">{format(overdue)}</dd></div> : null}
        <div className="flex justify-between gap-4 border-t border-base-300 pt-3 text-base font-semibold">
          <dt>Balance due</dt><dd className="tabular-nums">{format(balance)}</dd>
        </div>
      </dl>
    </article>
  );
}
