import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { DemoAccountsLink } from '../../components/demo/DemoAccountsLink';
import { apiErrorMessage } from '../../lib/api';
import type { AuthRole } from '../../lib/auth-store';
import { login } from '../../lib/auth-store';
import { homePath } from '../../lib/roles';
import { useSession } from '../../lib/session';

const FIELD = 'input h-12 w-full rounded-field border-base-300 bg-base-100 text-[15px] focus:border-brand/50 focus:outline-none';

export function LoginForm() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading, refresh } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [remember, setRemember] = useState(true);
  const googleEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  // Already signed in? Send the user straight to their dashboard.
  useEffect(() => {
    if (!sessionLoading && user) navigate(homePath[user.role], { replace: true });
  }, [sessionLoading, user, navigate]);

  function handleGoogleSuccess(account: { role: AuthRole }) {
    void refresh().then(() => navigate(homePath[account.role], { replace: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const account = await login(email.trim(), password, remember);
      await refresh();
      navigate(homePath[account.role], { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand">Deutsch Sprache RW</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">Sign in to continue your lessons, classes and progress.</p>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input type="email" required autoComplete="email" placeholder="name@sparch.rw" value={email}
            onChange={(event) => setEmail(event.currentTarget.value)} className={FIELD} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input type="password" required autoComplete="current-password" placeholder="••••••••" value={password}
            onChange={(event) => setPassword(event.currentTarget.value)} className={FIELD} />
        </label>

        {error ? (
          <p role="alert" className="rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-coral">{error}</p>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="checkbox checkbox-sm" checked={remember}
              onChange={(event) => setRemember(event.currentTarget.checked)} />
            Keep me signed in
          </label>
          <Link to="/forgot-password" className="font-medium text-brand hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={pending}
          className="btn mt-2 h-12 w-full gap-2 rounded-full border-0 bg-brand text-[15px] text-white hover:bg-brand/90 disabled:opacity-60">
          {pending ? <span className="loading loading-spinner loading-sm" /> : null}
          Sign in
          <FiArrowRight aria-hidden />
        </button>
      </form>

      {googleEnabled ? (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton remember={remember} onSuccess={handleGoogleSuccess} onError={setError} />
        </>
      ) : null}

      <p className="mt-10 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">Create a student account</Link>
      </p>
      <DemoAccountsLink />
    </section>
  );
}
