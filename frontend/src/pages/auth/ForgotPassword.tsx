import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage,apiPost } from '../../lib/api';

type ForgotResult = { message: string; resetUrl?: string };

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null); setMessage(null); setResetUrl(null);
    try {
      const result = await apiPost<ForgotResult>('/auth/forgot-password', { email: email.trim() });
      setMessage(result.message);
      setResetUrl(result.resetUrl ?? null);
    } catch (cause) { setError(apiErrorMessage(cause, 'Could not request a reset link. Try again.')); }
    finally { setBusy(false); }
  }

  return <section className="rounded-box bg-base-100 p-6 sm:p-8">
    <h1 className="text-xl font-semibold sm:text-2xl">Reset your password</h1>
    <p className="mt-2 text-sm leading-relaxed text-muted">Enter your account email. If it is registered, we’ll send a reset link that expires in one hour.</p>
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Email</span><input className="input w-full" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.currentTarget.value)} /></label>
      {message ? <div role="status" className="alert alert-success alert-soft text-sm">{message}</div> : null}
      {resetUrl ? <a className="link link-primary block break-all text-sm" href={resetUrl}>Open development reset link</a> : null}
      {error ? <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div> : null}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
    <Link className="link link-primary mt-5 inline-block text-sm" to="/login">Back to sign in</Link>
  </section>;
}
