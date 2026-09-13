import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export function Login() {
  return (
    <section className="card-shadow rounded-box bg-base-100 p-6 sm:p-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Welcome back</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Sign in to reach your lessons, notes, attendance and payment history.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="name@sparch.rw"
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
            className="input w-full rounded-field border-line bg-base-200"
          />
        </label>

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
          className="btn w-full gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
        >
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
