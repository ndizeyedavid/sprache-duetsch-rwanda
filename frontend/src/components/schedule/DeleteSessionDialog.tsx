import { format } from 'date-fns';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { deleteSession } from '../../lib/session-actions';
import { Dialog } from '../ui/overlay/Dialog';
import { useLastValue } from '../ui/overlay/useLastValue';

type Target = { id: string; title: string; startAt: string; endAt: string; status: string };
type Props = { session: Target | null; onClose: () => void; onDone: () => void };

/** Permanently remove a class created by mistake. Classes with attendance must be cancelled instead (the API enforces it). */
export function DeleteSessionDialog({ session: current, onClose, onDone }: Props) {
  const session = useLastValue(current);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!session) return null;
  const upcoming = session.status !== 'CANCELLED' && Date.parse(session.endAt) > Date.now();

  async function remove() {
    if (!session) return;
    setBusy(true); setError(null);
    try { await deleteSession(session.id, reason.trim() || undefined); setReason(''); onDone(); }
    catch (err) { setError(apiErrorMessage(err, 'Could not delete this class.')); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={Boolean(current)} onClose={() => { setError(null); onClose(); }} busy={busy} size="sm" icon={FiTrash2}
      title="Delete class" subtitle={`${session.title || 'Untitled class'} · ${format(new Date(session.startAt), 'EEE d MMM, HH:mm')}`}
      footer={<>
        <button type="button" className="btn btn-ghost btn-sm rounded-full" disabled={busy} onClick={onClose}>Keep class</button>
        <button type="button" className="btn btn-error btn-sm rounded-full" disabled={busy} onClick={() => void remove()}>
          {busy ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 aria-hidden />}Delete permanently
        </button>
      </>}>
      <div className="space-y-3 text-sm">
        <p>The class disappears from every schedule. This can't be undone.</p>
        <p className="rounded-box bg-base-200 p-3 text-xs text-muted">Use delete for classes created by mistake. If the class already took place or students joined, <strong>cancel</strong> it instead — attendance stays on record.</p>
        {upcoming ? (
          <label className="block"><span className="mb-1.5 block text-xs font-medium">Message to students (optional)</span>
            <textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="textarea w-full" placeholder="e.g. Added by mistake — the real class is on Thursday." /></label>
        ) : null}
        {error ? <p role="alert" className="alert alert-error alert-soft text-xs">{error}</p> : null}
      </div>
    </Dialog>
  );
}
