import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { login } from '../../lib/auth-store';
import { homePath } from '../../lib/roles';
import { useSession } from '../../lib/session';
import { GoogleButton } from '../../components/auth/GoogleButton';

export function LoginForm() {
 const navigate = useNavigate();
 const { user, loading: sessionLoading, refresh } = useSession();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);
 const [pending, setPending] = useState(false);

 // Already signed in? Send the user straight to their dashboard.
 useEffect(() => {
 if (!sessionLoading && user) {
 navigate(homePath[user.role], { replace: true });
 }
 }, [sessionLoading, user, navigate]);

  function handleGoogleSuccess(account: { role: import('../../lib/auth-store').AuthRole }) {
  void refresh().then(() => navigate(homePath[account.role], { replace: true }));
  }

  async function handleSubmit(event: FormEvent) {
  event.preventDefault();
  setError(null);
  setPending(true);
  try {
  const account = await login(email.trim(), password);

  await refresh();
  navigate(homePath[account.role], { replace: true });
  } catch (err) {
  setError(apiErrorMessage(err, 'Sign in failed. Please try again.'));
  } finally {
  setPending(false);
  }
  }

 return (
 <section className=" rounded-box bg-base-100 p-6 sm:p-8">
 <span className="inline-flex rounded-full bg-brand-tint px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
 Sign in
 </span>
 <h1 className="mt-3 text-xl font-semibold sm:text-2xl">Welcome back</h1>
 <p className="mt-1 text-sm leading-relaxed text-muted">Sign in to access your school account.</p>

 <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Email</span>
 <input
 type="email"
 required
 autoComplete="email"
 placeholder="name@sparch.rw"
 value={email}
 onChange={(event) => setEmail(event.currentTarget.value)}
 className="input w-full rounded-field border-line bg-base-200"
 />
 </label>

 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Password</span>
 <input
 type="password"
 required
 autoComplete="current-password"
 placeholder="••••••••"
 value={password}
 onChange={(event) => setPassword(event.currentTarget.value)}
 className="input w-full rounded-field border-line bg-base-200"
 />
 </label>

 {error ? (
 <div role="alert" className="rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">
 <p>{error}</p>
 </div>
 ) : null}

 <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
 <label className="flex items-center gap-2">
 <input type="checkbox" className="checkbox checkbox-sm" />
 <span className="text-muted">Keep me signed in</span>
 </label>
 <a href="#reset" className="font-medium text-brand hover:underline">
 Forgot password?
 </a>
 </div>

  <button
  type="submit"
  disabled={pending}
  className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
  >
  {pending ? <span className="loading loading-spinner loading-sm" /> : null}
  Sign in
  <FiArrowRight aria-hidden />
  </button>
  </form>

  <div className="my-4 flex items-center gap-3">
  <span className="h-px flex-1 bg-line" />
  <span className="text-xs text-muted">or</span>
  <span className="h-px flex-1 bg-line" />
  </div>

  <GoogleButton onSuccess={handleGoogleSuccess} onError={setError} />

 <p className="mt-6 text-center text-xs text-muted">
 New here?{' '}
 <Link to="/register" className="font-medium text-brand hover:underline">
 Create a student account
 </Link>
 </p>
 </section>
 );
}
