import { useState } from 'react';
import { FiCheckCircle,FiPlayCircle } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { updateSession } from '../../lib/services';

type Props = { session: { id: string; status: string; startAt: string; endAt: string }; onSaved: () => void };

/** Start / complete a class from the drawer; nothing to do before it starts or once it is closed. */
export function SessionLifecycle({ session, onSaved }: Props) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const started = Date.parse(session.startAt) <= Date.now(), ended = Date.parse(session.endAt) <= Date.now();
  if (['COMPLETED', 'CANCELLED'].includes(session.status)) return null;
  async function change(status: string) {
    if (status === 'COMPLETED' && !confirm('Mark this class completed?')) return;
    setBusy(true); setError('');
    try { await updateSession(session.id, { status }); onSaved(); } catch (e) { setError(apiErrorMessage(e, 'Could not change class status.')); } finally { setBusy(false); }
  }
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-box border border-line p-3">
      <p className="min-w-0 flex-1 text-xs text-muted">{!started ? 'You can start the class at its scheduled time.' : ended ? 'Class time is over — close it to finish attendance.' : 'Class time is now.'}</p>
      {started && !ended && session.status !== 'LIVE' ? <button type="button" disabled={busy} className="btn btn-primary btn-sm gap-1.5 rounded-full" onClick={() => void change('LIVE')}><FiPlayCircle aria-hidden />Start class</button> : null}
      {started ? <button type="button" disabled={busy} className="btn btn-sm gap-1.5 rounded-full border-line bg-base-100" onClick={() => void change('COMPLETED')}><FiCheckCircle aria-hidden />Mark completed</button> : null}
      {error ? <p className="w-full text-xs text-error" role="alert">{error}</p> : null}
    </section>
  );
}
