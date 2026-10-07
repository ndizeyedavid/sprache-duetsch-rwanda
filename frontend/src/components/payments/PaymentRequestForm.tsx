import { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiLock, FiSmartphone } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';

type Props = { balance: number; minimum: number; busy: boolean; onPay: (amount: number, phone: string) => Promise<void> };

export function PaymentRequestForm({ balance, minimum, busy, onPay }: Props) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [review, setReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedPhone = phone.replace(/[\s()-]/g, '').replace(/^(?:\+?250|00250)/, '0');
  const value = Number(amount);
  const validate = () => {
    if (!/^07[2389]\d{7}$/.test(normalizedPhone)) return 'Enter a valid MTN MoMo or Airtel Money number in Rwanda.';
    if (!Number.isInteger(value) || value < minimum || value > Math.floor(balance)) {
      return `Enter a whole amount from ${currencyAmount(minimum, 'RWF')} to ${currencyAmount(Math.floor(balance), 'RWF')}.`;
    }
    return null;
  };
  return <form className="mt-5 space-y-4" onSubmit={event => {
    event.preventDefault();
    const issue = validate(); setError(issue);
    if (issue) { setReview(false); return; }
    if (!review) { setReview(true); return; }
    void onPay(value, normalizedPhone);
  }}>
    {review ? <div className="rounded-box border border-base-300 bg-base-200/40 p-4" role="status">
      <p className="text-xs font-medium text-base-content/60">Review your payment</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{currencyAmount(value, 'RWF')}</p>
      <div className="mt-4 flex items-center gap-3 border-t border-base-300 pt-4">
        <FiSmartphone className="text-xl text-base-content/60" aria-hidden />
        <div><p className="text-sm font-semibold">{normalizedPhone}</p><p className="text-xs text-base-content/60">Approve the request on this phone</p></div>
      </div>
      <p className="mt-3 text-xs leading-5 text-base-content/60">Your balance after confirmation: {currencyAmount(balance - value, 'RWF')}.</p>
    </div> : <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Mobile-money number
          <input className="input mt-2 w-full" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 078 123 4567" required
            aria-describedby="payment-phone-hint" value={phone} onChange={event => { setPhone(event.target.value); setError(null); }} disabled={busy} />
          <span id="payment-phone-hint" className="mt-1.5 block text-xs font-normal text-base-content/60">MTN MoMo or Airtel Money</span>
        </label>
        <label className="block text-sm font-medium">Amount (RWF)
          <input className="input mt-2 w-full tabular-nums" type="number" inputMode="numeric" min={minimum} max={Math.floor(balance)} step="1"
            placeholder="Enter an amount" required value={amount} onChange={event => { setAmount(event.target.value); setError(null); }} disabled={busy} />
          <span className="mt-1.5 block text-xs font-normal text-base-content/60">Pay in full or choose an instalment</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-base-content/60">Quick amount</span>
        {[...new Set([Math.floor(balance / 2), Math.floor(balance)])].filter(sum => sum >= minimum).map(sum =>
          <button key={sum} type="button" className={`btn btn-sm ${value === sum ? 'btn-active' : 'btn-ghost border border-base-300'}`}
            disabled={busy} onClick={() => { setAmount(String(sum)); setError(null); }}>{sum === Math.floor(balance) ? 'Full balance' : 'Half balance'}</button>)}
      </div>
    </>}
    {error ? <p className="text-sm text-error" role="alert">{error}</p> : null}
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
      {review ? <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setReview(false)}><FiArrowLeft aria-hidden />Edit details</button> : null}
      <button className="btn btn-primary min-h-12 w-full sm:ml-auto sm:w-auto" type="submit" disabled={busy}>
        {busy ? <><span className="loading loading-spinner loading-sm" aria-hidden />Sending request…</> : <>{review ? 'Send payment request' : 'Review payment'}<FiArrowRight aria-hidden /></>}
      </button>
    </div>
    <p className="flex items-start gap-2 text-xs leading-5 text-base-content/60"><FiLock className="mt-1 shrink-0" aria-hidden />
      You approve payments on your phone. Your mobile-money PIN stays with you.</p>
  </form>;
}
