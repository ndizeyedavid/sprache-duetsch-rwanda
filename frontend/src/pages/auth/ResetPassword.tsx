import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link,useSearchParams } from 'react-router-dom';
import { apiErrorMessage,apiPost } from '../../lib/api';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
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
    <h1 className="text-xl font-semibold sm:text-2xl">Choose a new password</h1>
    {done ? <div className="mt-5 space-y-4"><div role="status" className="alert alert-success alert-soft">Password updated. You can sign in now.</div><Link className="btn btn-primary w-full" to="/login">Sign in</Link></div> : <form className="mt-6 space-y-4" onSubmit={submit}>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">New password</span><input className="input w-full" type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={password} onChange={e => setPassword(e.currentTarget.value)} /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Confirm password</span><input className="input w-full" type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.currentTarget.value)} /></label>
      {error ? <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div> : null}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
      <Link className="link link-primary block text-center text-sm" to="/forgot-password">Request a new reset link</Link>
    </form>}
  </section>;
}
