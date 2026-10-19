import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { rescheduleSession } from '../../lib/session-actions';
import { sessionTimeLabels,viewerTimeZone,zonedInputs,zonedToUtcIso } from '../../lib/session-time';
import { Modal } from '../ui/Modal';
import { withinSchoolHours } from './session-editor/useSessionDraft';

type Target = { id: string; title: string; startAt: string; endAt: string; timezone: string | null };
type Props = { session: Target | null; onClose: () => void; onDone: () => void };

/** Moves a class via POST /sessions/:id/reschedule. Inputs are wall-clock times in the class timezone. */
export function RescheduleSessionDialog({ session, onClose, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={Boolean(session)} onClose={onClose} busy={busy} title="Reschedule class">
      {session ? <RescheduleForm key={session.id} session={session} busy={busy} onBusy={setBusy} onClose={onClose} onDone={onDone} /> : null}
    </Modal>
  );
}

function RescheduleForm({ session, busy, onBusy, onClose, onDone }: { session: Target; busy: boolean; onBusy: (v: boolean) => void; onClose: () => void; onDone: () => void }) {
  const zone = session.timezone || viewerTimeZone();
  const initialStart = zonedInputs(session.startAt, zone), initialEnd = zonedInputs(session.endAt, zone);
  const [date, setDate] = useState(initialStart.date);
  const [start, setStart] = useState(initialStart.time);
  const [end, setEnd] = useState(initialEnd.time);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const startAt = date && start ? zonedToUtcIso(date, start, zone) : '';
  const endAt = date && end ? zonedToUtcIso(date, end, zone) : '';
  const preview = startAt && endAt && startAt < endAt ? sessionTimeLabels(startAt, endAt, zone).local : null;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!startAt || !endAt || startAt >= endAt) { setError('End must be after start.'); return; }
    if (Date.parse(startAt) <= Date.now()) { setError('Pick a time in the future.'); return; }
    if (!withinSchoolHours(start, end)) { setError('Classes run between 08:00 and 22:00.'); return; }
    if (startAt === session.startAt && endAt === session.endAt) { setError('Choose a different date or time.'); return; }
    onBusy(true);
    setError('');
    try { await rescheduleSession(session.id, { startAt, endAt, reason: reason.trim() || undefined }); onDone(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not reschedule this class.')); }
    finally { onBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm">Move <strong>{session.title || 'this class'}</strong>. Students are notified of the new time.</p>
      <fieldset className="fieldset" disabled={busy}>
        <legend className="fieldset-legend">New time · {zone.replaceAll('_', ' ')}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="col-span-2 text-xs sm:col-span-1">Date<input required type="date" min={new Date().toLocaleDateString('en-CA')} className="input mt-1 w-full" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className="text-xs">Start<input required type="time" min="08:00" max="21:30" className="input mt-1 w-full" value={start} onChange={e => setStart(e.target.value)} /></label>
          <label className="text-xs">End<input required type="time" min="08:30" max="22:00" className="input mt-1 w-full" value={end} onChange={e => setEnd(e.target.value)} /></label>
        </div>
        {preview ? <p className="label">Your time: {preview.date} · {preview.start}–{preview.end}</p> : null}
        <label className="mt-2 text-xs">Reason (optional)
          <textarea maxLength={500} rows={2} className="textarea mt-1 w-full" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Public holiday" />
        </label>
      </fieldset>
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
      <div className="modal-action">
        <button type="button" disabled={busy} onClick={onClose} className="btn btn-sm rounded-full">Back</button>
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm rounded-full">{busy ? 'Saving…' : 'Reschedule'}</button>
      </div>
    </form>
  );
}
