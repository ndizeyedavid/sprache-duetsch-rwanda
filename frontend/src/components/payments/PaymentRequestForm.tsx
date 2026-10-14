import { useState } from 'react';
import { FiArrowLeft, FiSmartphone } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';

type Props = { balance: number; minimum: number; busy: boolean; onPay: (amount: number, phone: string) => Promise<void> };

const FIELD = 'input h-12 w-full rounded-field border-base-300 bg-base-100 text-[15px] focus:border-brand focus:outline-none';

export function PaymentRequestForm({ balance, minimum, busy, onPay }: Props) {
  const full = Math.floor(balance);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(String(full));
  const [review, setReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedPhone = phone.replace(/[\s()-]/g, '').replace(/^(?:\+?250|00250)/, '0');
  const value = Number(amount);
  const options = [...new Set([full, Math.floor(full / 2)])].filter(sum => sum >= minimum);
  const validate = () => {
    if (!/^07[2389]\d{7}$/.test(normalizedPhone)) return 'Enter an MTN or Airtel number, for example 078 123 4567.';
    if (!Number.isInteger(value) || value < minimum || value > full) return `Enter an amount between ${currencyAmount(minimum, 'RWF')} and ${currencyAmount(full, 'RWF')}.`;
    return null;
  };

  return (
    <form className="mt-6 flex flex-1 flex-col gap-5" onSubmit={event => {
      event.preventDefault();
      const issue = validate(); setError(issue);
      if (issue) { setReview(false); return; }
      if (!review) { setReview(true); return; }
      void onPay(value, normalizedPhone);
    }}>
      {review ? (
        <div className="rounded-box border border-base-300 p-5" role="status">
          <p className="text-sm text-muted">You are paying</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{currencyAmount(value, 'RWF')}</p>
          <p className="mt-4 flex items-center gap-2 text-sm"><FiSmartphone aria-hidden className="text-muted" />Request goes to <strong className="tabular-nums">{normalizedPhone}</strong></p>
          <p className="mt-1 text-xs text-muted">Left after this payment: {currencyAmount(balance - value, 'RWF')}</p>
        </div>
      ) : (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Phone number</span>
            <input className={FIELD} type="tel" inputMode="tel" autoComplete="tel" placeholder="078 123 4567" required value={phone}
              onChange={event => { setPhone(event.target.value); setError(null); }} disabled={busy} />
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium">Amount</span>
            <div className="mb-3 flex flex-wrap gap-2">
              {options.map(sum => (
                <button key={sum} type="button" disabled={busy} onClick={() => { setAmount(String(sum)); setError(null); }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${value === sum ? 'border-brand bg-brand text-primary-content' : 'border-base-300 hover:border-brand'}`}>
                  {sum === full ? 'Full amount' : 'Half'} · {currencyAmount(sum, 'RWF')}
                </button>
              ))}
            </div>
            <input className={`${FIELD} tabular-nums`} type="number" inputMode="numeric" min={minimum} max={full} step="1" required aria-label="Amount in RWF"
              value={amount} onChange={event => { setAmount(event.target.value); setError(null); }} disabled={busy} />
          </div>
        </>
      )}
      {error ? <p className="text-sm text-error" role="alert">{error}</p> : null}
      <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row">
        {review ? <button className="btn btn-ghost h-12 rounded-full" type="button" disabled={busy} onClick={() => setReview(false)}><FiArrowLeft aria-hidden />Back</button> : null}
        <button className="btn h-12 w-full rounded-full border-0 bg-brand sm:flex-1 text-[15px] text-white hover:bg-brand hover:text-primary-content" type="submit" disabled={busy}>
          {busy ? <><span className="loading loading-spinner loading-sm" aria-hidden />Sending…</> : review ? `Pay ${currencyAmount(value, 'RWF')}` : 'Continue'}
        </button>
      </div>
    </form>
  );
}
