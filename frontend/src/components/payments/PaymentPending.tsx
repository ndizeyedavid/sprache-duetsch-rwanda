import { FiRefreshCw, FiSmartphone } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import type { PaymentCheckout } from '../../lib/paypack';
import { PaymentStatusBadge } from './PaymentStatusBadge';

type Props = { row: PaymentCheckout; checking: boolean; onCheck: () => void };
export function PaymentPending({ row, checking, onCheck }: Props) {
  const uncertain = row.status === 'UNKNOWN';
  const initiating = row.status === 'INITIATING';
  return <div className="mt-5 rounded-box border border-base-300 bg-base-200 p-4 sm:p-5" role="status" aria-live="polite">
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-base-100"><FiSmartphone className="text-xl" aria-hidden /></span>
      <div className="min-w-0 flex-1"><h3 className="font-semibold">{uncertain ? 'Let’s confirm your payment' : initiating ? 'Preparing your request' : 'Check your phone'}</h3>
        <p className="mt-0.5 text-xs text-muted">{uncertain ? 'Your payment result is still being verified' : initiating ? 'Connecting to your mobile-money provider' : 'Your request has been sent for approval'}</p></div>
      <PaymentStatusBadge status={row.status} />
    </div>
    <div className="my-5 grid gap-3 border-y border-base-300 py-4 sm:grid-cols-2">
      <div><p className="text-xs text-muted">Payment amount</p><p className="mt-1 text-xl font-semibold tabular-nums">{currencyAmount(Number(row.amount), row.currency)}</p></div>
      <div><p className="text-xs text-muted">Mobile-money number</p><p className="mt-1 text-lg font-medium tabular-nums">{row.phone}</p></div>
    </div>
    <p className="text-sm leading-6">{uncertain ? 'Check your mobile-money history and contact finance with the reference below before making another payment.'
      : 'Open the mobile-money prompt and approve using your PIN. Your balance and receipt update once payment is confirmed.'}</p>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-xs text-muted">{row.providerRef ? <><span className="loading loading-dots loading-xs" aria-hidden />Checking automatically</> : 'Waiting for provider confirmation'}</p>
      <button className="btn btn-sm min-h-10" disabled={checking} onClick={onCheck}>
        <FiRefreshCw className={checking ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden />{checking ? 'Checking…' : 'Check status'}</button>
    </div>
    <details className="mt-4 border-t border-base-300 pt-3 text-xs text-muted">
      <summary className="cursor-pointer">Payment reference</summary>
      <p className="mt-2 break-all">Request: {row.id}</p>{row.providerRef ? <p className="mt-1 break-all">Reference: {row.providerRef}</p> : null}
    </details>
  </div>;
}
