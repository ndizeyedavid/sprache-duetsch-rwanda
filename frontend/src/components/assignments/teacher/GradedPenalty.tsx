import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import { overrideLatePenalty } from '../../../lib/homework';
import { lateDuration, scoreAfterPenalty } from '../homework/late-policy';
import type { Submission } from '../homework/types';

type Props = { assignmentId: string; submission: Submission; maxPoints: string | number; onSaved: () => void };

/** After grading: show the penalty that was applied and let the teacher waive or change it, with a reason. */
export function GradedPenalty({ assignmentId, submission: s, maxPoints, onSaved }: Props) {
  const applied = Number(s.latePenaltyPercent ?? 0), version = s.versions?.[0];
  const [open, setOpen] = useState(false), [percent, setPercent] = useState(String(applied)), [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  if (s.status !== 'GRADED' || (!applied && !version?.isLate)) return null;
  const raw = Number(s.rawScore ?? s.score ?? 0);
  async function save() {
    const value = Number(percent);
    if (percent === '' || !Number.isFinite(value) || value < 0 || value > 100) { setError('Enter a penalty between 0 and 100%.'); return; }
    if (reason.trim().length < 3) { setError('Give a short reason. It is kept in the audit log.'); return; }
    setBusy(true); setError('');
    try { await overrideLatePenalty(assignmentId, s.id, { percent: value, reason: reason.trim() }); setOpen(false); onSaved(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not change the penalty.')); }
    finally { setBusy(false); }
  }
  return (
    <div className="mt-3 space-y-2 rounded-field bg-base-100 p-3 text-xs text-base-content">
      <p>{version?.lateByMinutes ? `Late by ${lateDuration(version.lateByMinutes)} · ` : ''}Teacher score {raw} · Late penalty {applied}% · Final {s.score}/{maxPoints}</p>
      {open ? (
        <div className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)_auto]">
          <label className="flex items-center gap-1"><input type="number" aria-label="New penalty percent" className="input input-xs w-16" min={0} max={100} step={0.5} value={percent} onChange={e => setPercent(e.target.value)} />%</label>
          <input className="input input-xs w-full" aria-label="Reason for the change" placeholder="Reason (kept in the audit log)" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} />
          <button type="button" className="btn btn-xs" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : `Save · ${scoreAfterPenalty(raw, Number(percent || 0))}/${maxPoints}`}</button>
        </div>
      ) : <button type="button" className="btn btn-ghost btn-xs" onClick={() => setOpen(true)}>Waive or change penalty</button>}
      {error ? <p role="alert" className="text-error">{error}</p> : null}
    </div>
  );
}
