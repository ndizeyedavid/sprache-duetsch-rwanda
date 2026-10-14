import { useEffect, useState } from 'react';
import { FiArrowLeft, FiMail } from 'react-icons/fi';

type Props = {
  email: string;
  /** Epoch ms when another code may be requested. */
  resendAt: number;
  /** Shown only by non-production APIs, where email may not be configured. */
  devCode?: string;
  pending: boolean;
  resending: boolean;
  error: string | null;
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
};

/** Step 2 of sign-up: enter the 6-digit code emailed to the student. */
export function RegisterOtpStep({ email, resendAt, devCode, pending, resending, error, onVerify, onResend, onBack }: Props) {
  const [code, setCode] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (wait === 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [wait]);

  const update = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !pending) onVerify(digits);
  };

  return (
    <section className="rounded-box bg-base-100 p-6 sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <FiMail className="text-xl" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-semibold sm:text-2xl">Check your email</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        We sent a 6-digit code to <strong className="break-all text-base-content">{email}</strong>. Enter it to create your account.
      </p>

      <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); if (code.length === 6) onVerify(code); }}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Verification code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            pattern="\d{6}"
            maxLength={6}
            placeholder="••••••"
            value={code}
            disabled={pending}
            onChange={(event) => update(event.currentTarget.value)}
            className="input h-14 w-full rounded-field border-line bg-base-200 text-center font-mono text-2xl tracking-[0.5em] tabular-nums"
          />
        </label>

        {devCode ? <p className="text-xs text-muted">Development mode: your code is <strong className="font-mono">{devCode}</strong>.</p> : null}
        {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60"
        >
          {pending ? <span className="loading loading-spinner loading-sm" /> : null}
          Verify and create account
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <button type="button" className="inline-flex items-center gap-1 font-medium text-muted hover:text-base-content" onClick={onBack} disabled={pending}>
          <FiArrowLeft aria-hidden />Change details
        </button>
        <button type="button" className="font-medium text-brand hover:underline disabled:text-muted disabled:no-underline" onClick={onResend} disabled={wait > 0 || resending || pending}>
          {resending ? 'Sending…' : wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
        </button>
      </div>
      <p className="mt-4 text-xs text-muted">Can’t find it? Check your spam folder. The code expires in 10 minutes.</p>
    </section>
  );
}
