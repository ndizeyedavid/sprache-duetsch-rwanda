import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { ReceiptVerification } from '../../lib/receipt-verification';
import { longDate } from '../certificate-verification/format';

/** Public receipt check: status first, then the few facts needed to trust it. */
export function ReceiptCheckRecord({ data }: { data: ReceiptVerification }) {
  const facts = [
    { label: 'Date paid', value: longDate(data.paidAt) },
    { label: 'Method', value: data.method },
    { label: 'Receipt number', value: data.receiptNumber, mono: true },
  ];
  return (
    <article className="page-enter overflow-hidden rounded-[1.75rem] border border-base-300 bg-base-100">
      <div className={`flex items-center gap-3 px-6 py-4 sm:px-10 ${data.valid ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
        <span className={`grid size-9 shrink-0 place-items-center rounded-full text-white ${data.valid ? 'bg-success' : 'bg-error'}`}>
          {data.valid ? <FiCheck aria-hidden className="text-lg" /> : <FiAlertTriangle aria-hidden />}
        </span>
        <div>
          <p className={`font-semibold ${data.valid ? 'text-success' : 'text-error'}`}>{data.valid ? 'Genuine receipt' : 'This receipt was cancelled'}</p>
          <p className="text-xs text-muted">{data.valid ? 'Issued by Deutsch Sprache RW and recorded in the school accounts.' : `It was cancelled by the school${data.voidedAt ? ` on ${longDate(data.voidedAt)}` : ''}.`}</p>
        </div>
      </div>
      <div className={`relative overflow-hidden px-6 py-9 sm:px-10 sm:py-12 ${data.valid ? '' : 'opacity-70'}`}>
        <img src="/logo.png" alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 size-72 opacity-[0.05]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand">Payment receipt</p>
        <p className="mt-7 text-sm text-muted">Payment received from</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{data.payerName}</h1>
        <p className="mt-6 text-sm text-muted">Amount</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{currencyAmount(Number(data.amount), data.currency)}</p>
        {data.course ? <p className="mt-3 text-sm">For <span className="font-semibold">{data.course}</span></p> : null}
        <dl className="mt-9 grid gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 sm:grid-cols-3">
          {facts.map(fact => (
            <div key={fact.label} className="bg-base-100 p-4">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className={`mt-1 font-semibold ${fact.mono ? 'font-mono text-sm' : ''}`}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
