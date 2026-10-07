import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getPaypackConfig } from '../../lib/paypack';
import { currencyAmount } from '../../lib/format';
import { Panel } from '../ui/Panel';
import { usePaypackCheckout } from './usePaypackCheckout';

type Props = { balance: number; currency: string; onPaid: () => void };
export function PaypackCheckout({ balance, currency, onPaid }: Props) {
  const config = useApi('paypack-config', getPaypackConfig);
  const checkout = usePaypackCheckout(onPaid);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const available = config.data?.enabled && currency === 'RWF';
  return (
    <Panel>
      <h2 className="text-base font-semibold">Pay with mobile money</h2>
      <p className="mt-1 text-sm text-base-content/70">MTN MoMo or Airtel Money. You can pay your tuition in instalments.</p>
      {config.loading || checkout.loading ? <p className="mt-3 text-sm" role="status">Loading payment options…</p> : null}
      {config.error ? <div className="alert alert-error mt-3" role="alert"><span>{config.error}</span><button className="btn btn-sm" onClick={config.refetch}>Retry</button></div> : null}
      {!config.loading && !config.error && !available ? <p className="mt-3 text-sm text-base-content/70">Online payments are not available for this account yet. Contact finance for payment instructions.</p> : null}
      {checkout.error ? <div className="alert alert-error mt-3" role="alert"><span>{checkout.error}</span><button className="btn btn-sm" onClick={() => void checkout.load()}>Reload</button></div> : null}
      {checkout.retryAvailable && !checkout.pending ? <button className="btn mt-3" disabled={checkout.busy} onClick={checkout.retry}>Retry the same payment request</button> : null}
      {checkout.pending ? (
        <div className="alert mt-4" role="status">
          <div>
            <p className="font-semibold">{checkout.pending.status === 'UNKNOWN' ? 'Payment needs confirmation' : 'Awaiting payment confirmation'}</p>
            <p className="mt-1 text-sm">{currencyAmount(Number(checkout.pending.amount), 'RWF')} · {checkout.pending.phone}</p>
            <p className="mt-1 text-sm">{checkout.pending.status === 'UNKNOWN'
              ? 'Contact finance with this request ID. Check your mobile-money history before making another payment.'
              : 'Approve the request on your phone using your mobile-money PIN. Keep your PIN on your phone.'}</p>
            <p className="mt-2 break-all text-xs">Request: {checkout.pending.id}</p>
            {checkout.pending.providerRef ? <p className="break-all text-xs">Reference: {checkout.pending.providerRef}</p> : null}
          </div>
          <button className="btn btn-sm" onClick={() => void checkout.refresh(checkout.pending!.id)}>Check status</button>
        </div>
      ) : available && balance >= (config.data?.minimumAmount ?? 100) && !checkout.loading && checkout.historyReady && !checkout.retryAvailable ? (
        <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); void checkout.pay(Number(amount), phone); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">Mobile-money number
              <input className="input w-full" type="tel" autoComplete="tel" placeholder="0781234567" required
                value={phone} onChange={event => setPhone(event.target.value)} disabled={checkout.busy} />
            </label>
            <label className="space-y-1 text-sm">Amount (RWF)
              <input className="input w-full" type="number" inputMode="numeric" min={config.data?.minimumAmount ?? 100}
                max={Math.floor(balance)} step="1" required value={amount} onChange={event => setAmount(event.target.value)} disabled={checkout.busy} />
            </label>
          </div>
          <p className="text-xs text-base-content/70">Outstanding: {currencyAmount(balance, currency)}. A receipt appears in Documents after confirmation.</p>
          <button className="btn" type="submit" disabled={checkout.busy}>{checkout.busy ? 'Requesting payment…' : 'Request payment on my phone'}</button>
        </form>
      ) : available && balance < 100 ? <p className="mt-3 text-sm">{balance > 0 ? 'For balances below 100 RWF, contact finance.' : 'Your tuition is fully paid.'}</p> : null}
      {checkout.rows.length > 0 ? (
        <ul className="mt-4 divide-y divide-base-300" aria-label="Recent mobile-money payments">
          {checkout.rows.slice(0, 5).map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
            <span>{currencyAmount(Number(row.amount), row.currency)} · {new Date(row.createdAt).toLocaleDateString()}</span>
            <span>{row.status === 'SUCCESSFUL' ? 'Payment received · receipt ready' : row.status === 'FAILED' ? 'Payment failed — you can try again' : 'Awaiting confirmation'}</span>
          </li>)}
        </ul>
      ) : null}
    </Panel>
  );
}
