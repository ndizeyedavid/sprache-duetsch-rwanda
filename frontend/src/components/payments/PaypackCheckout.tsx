import { FiCheckCircle } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { getPaypackConfig } from '../../lib/paypack';
import { BookLoader } from '../common/BookLoader';
import { PaymentPending } from './PaymentPending';
import { PaymentRequestForm } from './PaymentRequestForm';
import type { usePaypackCheckout } from './usePaypackCheckout';

type Props = { balance: number; currency: string; checkout: ReturnType<typeof usePaypackCheckout> };

/** Mobile-money payment through Paypack: the only way students pay online. */
export function PaypackCheckout({ balance, currency, checkout }: Props) {
  const config = useApi('paypack-config', getPaypackConfig);
  const available = config.data?.enabled && currency === 'RWF';
  const minimum = config.data?.minimumAmount ?? 100;
  const loading = config.loading || checkout.loading;
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-lg font-semibold">Pay with mobile money</h2>
      <p className="mt-1 text-sm text-muted">MTN MoMo or Airtel Money. Pay all at once or in parts.</p>
      {loading ? <BookLoader label="Loading…" className="flex-1 py-10" /> : null}
      {config.error ? <div className="alert alert-error alert-soft mt-5" role="alert"><span>{config.error}</span><button className="btn btn-sm" onClick={config.refetch}>Retry</button></div> : null}
      {!loading && !config.error && !available ? <p className="mt-5 rounded-box bg-base-200 p-4 text-sm text-muted">Online payment is not available right now. Please contact the finance office.</p> : null}
      {checkout.error ? <div className="alert alert-error alert-soft mt-5" role="alert"><span>{checkout.error}</span><button className="btn btn-sm" onClick={() => void checkout.load()}>Reload</button></div> : null}
      {checkout.retryAvailable && !checkout.pending ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted">The connection dropped. Resume the same request to see its result.</p>
          <button className="btn rounded-full" disabled={checkout.busy} onClick={checkout.retry}>{checkout.busy ? 'Resuming…' : 'Resume payment'}</button>
        </div>
      ) : null}
      {checkout.pending ? <PaymentPending row={checkout.pending} checking={checkout.checking} onCheck={() => void checkout.refresh(checkout.pending!.id)} />
        : available && !loading && balance >= minimum && checkout.historyReady && !checkout.retryAvailable
          ? <PaymentRequestForm balance={balance} minimum={minimum} busy={checkout.busy} onPay={checkout.pay} />
          : available && !loading && balance < minimum ? (
            <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-box bg-success text-success-content p-6 text-center">
              <FiCheckCircle className="text-3xl text-success" aria-hidden />
              <p className="mt-3 font-semibold">{balance > 0 ? 'Only a small amount is left' : 'You are all paid up'}</p>
              <p className="mt-1 text-sm text-muted">{balance > 0 ? `Amounts under ${minimum} RWF are settled with the finance office.` : 'Your receipts are in Documents.'}</p>
            </div>
          ) : null}
    </div>
  );
}
