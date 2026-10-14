import { useRef, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { apiErrorMessage } from '../../../lib/api';
import { grantExtension, removeExtension } from '../../../lib/homework';
import { DateTimeField } from '../../tasks/studio/fields';
import { dateLabel } from '../homework/format';
import type { Extension, RosterStudent } from '../homework/types';

type Props = { assignmentId: string; dueAt: string | null; student: RosterStudent; extension?: Extension; onChanged: () => void };

/** Give one student a later deadline (with an optional reason). The student is notified in the app. */
export function ExtensionControl({ assignmentId, dueAt, student, extension, onChanged }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<string | null>(extension?.dueAt ?? (dueAt ? new Date(new Date(dueAt).getTime() + 86400000).toISOString() : null));
  const [reason, setReason] = useState(extension?.reason ?? ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  if (!dueAt) return null;
  const name = `${student.user.firstName} ${student.user.lastName}`;
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError('');
    try { await action(); dialog.current?.close(); onChanged(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not update the extension.')); }
    finally { setBusy(false); }
  }
  function save() {
    if (!value || new Date(value) <= new Date(dueAt!)) { setError('Choose a deadline after the class deadline.'); return; }
    void run(() => grantExtension(assignmentId, student.id, { dueAt: value, reason: reason.trim() || undefined }));
  }
  return <>
    <button type="button" className="btn btn-ghost btn-xs" onClick={() => dialog.current?.showModal()}><FiClock aria-hidden />{extension ? 'Edit extension' : 'Extend'}</button>
    <dialog ref={dialog} className="modal modal-bottom sm:modal-middle" aria-label={`Extension for ${name}`}>
      <div className="modal-box space-y-3">
        <h3 className="font-semibold">Extension for {name}</h3>
        <p className="text-xs text-muted">Class deadline: {dateLabel(dueAt, true)}. {name.split(' ')[0]} is notified and sees the new deadline everywhere. Late penalties count from it.</p>
        <DateTimeField label="New deadline · your time" value={value} onChange={setValue} disabled={busy} />
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Reason (optional, shown to the student)</span>
          <input className="input input-sm w-full" maxLength={500} disabled={busy} placeholder="e.g. Medical note" value={reason} onChange={e => setReason(e.target.value)} /></label>
        {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
        <div className="modal-action flex-wrap">
          {extension ? <button type="button" className="btn btn-ghost btn-sm text-error sm:mr-auto" disabled={busy} onClick={() => confirm(`Remove ${name}'s extension?`) && void run(() => removeExtension(assignmentId, student.id))}>Remove extension</button> : null}
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save extension'}</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  </>;
}
