import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DemoAccountRow } from '../../components/demo/DemoAccountRow';
import { DEMO_GROUPS, DEMO_PASSWORD } from '../../components/demo/demo-accounts';
import { apiErrorMessage } from '../../lib/api';
import { clearTokens, login } from '../../lib/auth-store';
import { homePath } from '../../lib/roles';
import { useSession } from '../../lib/session';

/** Public list of demo logins: one click signs in as any role for quick testing. */
export function DemoAccounts() {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(email: string) {
    setError(null);
    setPendingEmail(email);
    try {
      clearTokens();
      const account = await login(email, DEMO_PASSWORD, false);
      await refresh();
      navigate(homePath[account.role], { replace: true });
    } catch (err) {
      setError(`${email}: ${apiErrorMessage(err, 'Sign in failed.')}`);
    } finally {
      setPendingEmail(null);
    }
  }

  return (
    <section>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-brand">Deutsch Sprache RW · Demo</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Demo accounts</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Every account uses the password <code className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-ink">{DEMO_PASSWORD}</code>.
      </p>

      {error ? <p role="alert" className="mt-5 rounded-field bg-coral px-3 py-2 text-xs font-medium text-coral">{error}</p> : null}

      {DEMO_GROUPS.map((group) => (
        <div key={group.title} className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{group.title}</h2>
          <ul className="mt-1 divide-y divide-base-300">
            {group.accounts.map((account) => (
              <DemoAccountRow key={account.email} account={account} pending={pendingEmail === account.email}
                disabled={pendingEmail !== null} onSignIn={signIn} />
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-10 text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-brand hover:underline">Back to sign in</Link>
      </p>
    </section>
  );
}
