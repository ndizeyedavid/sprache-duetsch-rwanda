import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { login } from '../../lib/auth-store';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card-shadow rounded-box bg-base-100 p-6 sm:p-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Welcome back</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Sign in to reach your lessons, notes, attendance and payment history.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="name@sparch.rw"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            onChange={(event) => setPassword(event.target.value)}
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

        {error ? (
          <p role="alert" className="text-xs font-medium text-error">
            {error}
          </p>
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

      <p className="mt-6 text-center text-xs text-muted">
        New here?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Create a student account
        </Link>
      </p>
    </section>
  );
}
