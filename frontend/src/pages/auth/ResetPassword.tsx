import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link,useSearchParams } from 'react-router-dom';
import { apiErrorMessage,apiPost } from '../../lib/api';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const setup = params.get('setup') === '1';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null);
    if (!token) { setError('This reset link is missing its token. Request a new link.'); return; }
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try { await apiPost('/auth/reset-password', { token, password }); setDone(true); }
    catch (cause) { setError(apiErrorMessage(cause, 'This link may have expired. Request a new one.')); }
    finally { setBusy(false); }
  }

  return <section className="rounded-box bg-base-100 p-6 sm:p-8">
    <h1 className="text-xl font-semibold sm:text-2xl">{setup ? 'Verify your email & set your password' : 'Choose a new password'}</h1>
    {setup && !done ? <p className="mt-3 text-sm text-base-content/70">Choose a password to confirm your email and finish setting up your student portal account. Course approval and enrollment are handled separately by admissions.</p> : null}
    {done ? <div className="mt-5 space-y-4"><div role="status" className="alert alert-success alert-soft">{setup ? 'Email verified. Your account is ready — you can sign in now.' : 'Password updated. You can sign in now.'}</div><Link className="btn btn-primary w-full" to="/login">Sign in</Link></div> : <form className="mt-6 space-y-4" onSubmit={submit}>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">New password</span><input className="input w-full" type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={password} onChange={e => setPassword(e.currentTarget.value)} /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Confirm password</span><input className="input w-full" type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.currentTarget.value)} /></label>
      {error ? <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div> : null}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : setup ? 'Verify email & create password' : 'Update password'}</button>
      <Link className="link link-primary block text-center text-sm" to="/forgot-password">Request a new reset link</Link>
    </form>}
  </section>;
}
