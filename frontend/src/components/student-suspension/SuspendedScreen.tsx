import { useState } from 'react';
import { FiAlertOctagon,FiLogOut,FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../lib/session';
import { Logo } from '../ui/Logo';

const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null);

/** What a suspended student sees after signing in: the alert, the reason, and a way out. */
export function SuspendedScreen() {
  const { user, refresh, signOut } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const since = day(user?.suspendedAt);
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-box border border-line bg-base-100">
        <div className="hero-band flex flex-col items-center gap-3 px-6 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-base-100 text-primary"><FiAlertOctagon size="1.75rem" aria-hidden /></span>
          <h1 className="text-xl font-bold">Your account is suspended</h1>
          <p className="text-sm">Hallo {user?.firstName}, you can't use your courses right now.</p>
        </div>
        <div className="space-y-4 p-6">
          <section role="alert" className="rounded-box border border-error p-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-error">Reason{since ? ` · since ${since}` : ''}</p>
            <p className="mt-1 whitespace-pre-line text-sm">{user?.suspendedReason || 'The school suspended your account. Please contact the office for details.'}</p>
          </section>
          <p className="text-xs text-muted">Your lessons, grades and payments are kept safe. Contact the school office to sort this out; once your account is reinstated, everything comes back.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => { setBusy(true); void refresh().finally(() => setBusy(false)); }}
              className="btn btn-sm rounded-full border-line bg-base-100">
              {busy ? <span className="loading loading-spinner loading-xs" /> : <FiRefreshCw aria-hidden />} Check again
            </button>
            <button type="button" onClick={() => void signOut().then(() => navigate('/login', { replace: true }))} className="btn btn-sm btn-primary ml-auto rounded-full">
              <FiLogOut aria-hidden /> Sign out
            </button>
          </div>
          <div className="flex justify-center pt-2 opacity-80"><Logo /></div>
        </div>
      </div>
    </main>
  );
}
