import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { cancelSession } from '../../lib/session-actions';
import { Modal } from '../ui/Modal';

type Target = { id: string; title: string };
type Props = { session: Target | null; onClose: () => void; onDone: () => void };

/** daisyUI modal: cancelling requires a reason, which students see in their notification and schedule. */
export function CancelSessionDialog({ session, onClose, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={Boolean(session)} onClose={onClose} busy={busy} title="Cancel class">
      {session ? <CancelForm key={session.id} session={session} busy={busy} onBusy={setBusy} onClose={onClose} onDone={onDone} /> : null}
    </Modal>
  );
}

function CancelForm({ session, busy, onBusy, onClose, onDone }: { session: Target; busy: boolean; onBusy: (v: boolean) => void; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = reason.trim();
    if (text.length < 3) { setError('Give students a short reason (at least 3 characters).'); return; }
    onBusy(true);
    setError('');
    try { await cancelSession(session.id, text); onDone(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not cancel this class.')); }
    finally { onBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm">
        <strong>{session.title || 'This class'}</strong> will be cancelled. Enrolled students are notified with your reason.
      </p>
      <fieldset className="fieldset" disabled={busy}>
        <legend className="fieldset-legend">Reason (required)</legend>
        <textarea required minLength={3} maxLength={500} rows={3} className="textarea w-full" value={reason}
          onChange={e => setReason(e.target.value)} placeholder="e.g. Teacher is ill — we will reschedule this week." />
        <p className="label">{reason.trim().length}/500 · shown to students</p>
      </fieldset>
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
      <div className="modal-action">
        <button type="button" disabled={busy} onClick={onClose} className="btn btn-sm rounded-full">Keep class</button>
        <button type="submit" disabled={busy} className="btn btn-error btn-sm rounded-full">{busy ? 'Cancelling…' : 'Cancel class'}</button>
      </div>
    </form>
  );
}
