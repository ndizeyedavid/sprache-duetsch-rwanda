import { FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getPaypackConfig } from '../../lib/paypack';
import { Panel } from '../ui/Panel';
import { PaymentPending } from './PaymentPending';
import { PaymentRequestForm } from './PaymentRequestForm';
import { PaymentRequestHistory } from './PaymentRequestHistory';
import { usePaypackCheckout } from './usePaypackCheckout';

type Props = { balance: number; currency: string; onPaid: () => void };
export function PaypackCheckout({ balance, currency, onPaid }: Props) {
  const config = useApi('paypack-config', getPaypackConfig);
  const checkout = usePaypackCheckout(onPaid);
  const available = config.data?.enabled && currency === 'RWF';
  const minimum = config.data?.minimumAmount ?? 100;
  const loading = config.loading || checkout.loading;
  return <Panel>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-box bg-base-200"><FiCreditCard className="text-xl" aria-hidden /></span>
        <div><h2 className="text-base font-semibold">Pay with mobile money</h2><p className="mt-1 text-xs text-base-content/60">Simple payments, at your pace</p></div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-base-300 px-3 py-1.5">MTN MoMo</span><span className="rounded-full border border-base-300 px-3 py-1.5">Airtel Money</span></div>
    </div>
    {loading ? <div className="flex items-center gap-2 py-8 text-sm text-base-content/60" role="status"><span className="loading loading-spinner loading-sm" aria-hidden />Loading payment options…</div> : null}
    {config.error ? <div className="alert alert-error alert-soft mt-4" role="alert"><span>{config.error}</span><button className="btn btn-sm" onClick={config.refetch}>Retry</button></div> : null}
    {!config.loading && !config.error && !available ? <p className="mt-4 rounded-box bg-base-200 p-4 text-sm leading-6 text-base-content/70">Online payments are currently unavailable. Use the payment instructions below or contact finance.</p> : null}
    {checkout.error ? <div className="alert alert-error alert-soft mt-4" role="alert"><span>{checkout.error}</span><button className="btn btn-sm" onClick={() => void checkout.load()}>Reload</button></div> : null}
    {checkout.retryAvailable && !checkout.pending ? <div className="mt-4 space-y-3">
      <p className="text-sm text-base-content/70">The connection was interrupted. Resume the same request to confirm its result.</p>
      <button className="btn w-full sm:w-auto" disabled={checkout.busy} onClick={checkout.retry}>{checkout.busy ? 'Resuming…' : 'Resume payment request'}</button>
    </div> : null}
    {checkout.pending ? <PaymentPending row={checkout.pending} checking={checkout.checking} onCheck={() => void checkout.refresh(checkout.pending!.id)} />
      : available && balance >= minimum && !loading && checkout.historyReady && !checkout.retryAvailable ?
        <PaymentRequestForm balance={balance} minimum={minimum} busy={checkout.busy} onPay={checkout.pay} />
      : available && balance < minimum && !loading ? <div className="mt-5 flex items-start gap-3 rounded-box bg-base-200/50 p-4">
        <FiCheckCircle className="mt-0.5 shrink-0 text-lg" aria-hidden /><div><p className="text-sm font-semibold">{balance > 0 ? 'A small balance remains' : 'You’re all paid up'}</p>
          <p className="mt-1 text-xs leading-5 text-base-content/60">{balance > 0 ? `For balances below ${minimum} RWF, contact finance to settle your account.` : 'There’s nothing outstanding. Your receipts are available in Documents.'}</p></div>
      </div> : null}
    {!checkout.pending && checkout.rows[0]?.status === 'SUCCESSFUL' ? <div className="alert alert-success alert-soft mt-4" role="status">
      <FiCheckCircle aria-hidden /><span>Your latest payment was received. Your receipt is ready.</span><Link className="btn btn-sm" to="/profile?view=documents">View receipt</Link>
    </div> : null}
    <PaymentRequestHistory rows={checkout.rows} />
  </Panel>;
}
