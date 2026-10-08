import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookLoader } from '../components/common/BookLoader';
import { DemoAccountCard } from '../components/demo/DemoAccountCard';
import { Logo } from '../components/ui/Logo';
import { useApi } from '../hooks/useApi';
import { apiErrorMessage } from '../lib/api';
import { login } from '../lib/auth-store';
import type { DemoAccount } from '../lib/demo-accounts';
import { listDemoAccounts } from '../lib/demo-accounts';
import { homePath } from '../lib/roles';
import { useSession } from '../lib/session';

/** Public test-account page: one account per role, each with a one-click sign-in. */
export function DemoAccounts() {
  const accounts = useApi('demo-accounts', listDemoAccounts);
  const { refresh } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  async function signIn(account: DemoAccount) {
    setBusy(account.email); setError(null);
    try {
      const user = await login(account.email, account.password, true);
      await refresh();
      navigate(homePath[user.role], { replace: true });
    } catch (err) { setError(apiErrorMessage(err, 'Could not sign in with this account.')); }
    finally { setBusy(null); }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/"><Logo size={38} withWordmark wordmarkClassName="text-ink" /></Link>
        <Link to="/login" className="text-sm font-medium text-brand hover:underline">Normal sign-in</Link>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-14">
        {error ? <p role="alert" className="mb-4 text-sm text-error">{error}</p> : null}
        {accounts.loading ? <BookLoader label="Loading accounts…" className="min-h-[40vh]" />
          : accounts.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.data.map(account => (
                <DemoAccountCard key={account.email} account={account} busy={busy === account.email} disabled={!!busy} onSignIn={a => void signIn(a)} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-base-300 bg-base-100 px-6 py-12 text-center">
              <h2 className="text-lg font-semibold">Test accounts are switched off</h2>
              <p className="mt-2 text-sm text-muted">Use your own account on the sign-in page.</p>
              <Link to="/login" className="btn btn-sm mt-5 rounded-full">Go to sign in</Link>
            </div>
          )}
      </main>
    </div>
  );
}
