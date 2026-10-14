import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import type { LevelItem } from '../../../lib/services/level-item';
import { runPlacement } from '../../../lib/services/run-placement';

type Props = { studentId: string; levels: LevelItem[]; onSaved: (message: string) => void };

/**
 * Staff entry for a paper test or interview. The server recommends a level from the
 * score; staff may also assign a level right away (a different one needs a reason).
 */
export function ManualPlacementForm({ studentId, levels, onSaved }: Props) {
  const [score, setScore] = useState('');
  const [levelId, setLevelId] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const saved = await runPlacement(studentId, {
        score: Number(score),
        assignedLevelId: levelId || undefined,
        overrideReason: reason.trim() || undefined,
        note: note.trim() || undefined,
      });
      setScore(''); setLevelId(''); setReason(''); setNote('');
      onSaved(`Recorded ${saved.score}% → recommended ${saved.recommendedLevel.code}${saved.assignedLevel ? `, assigned ${saved.assignedLevel.code}` : ''}.`);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Could not save the placement.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium">Score (0–100 %)</span>
        <input required value={score} onChange={(event) => setScore(event.currentTarget.value)} type="number" inputMode="numeric" min={0} max={100} placeholder="e.g. 72" className="input input-sm w-full rounded-field bg-base-200" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium">Assign level now (optional)</span>
        <select value={levelId} onChange={(event) => setLevelId(event.currentTarget.value)} className="select select-sm w-full rounded-field bg-base-200">
          <option value="">Decide later</option>
          {levels.filter((level) => level.isActive).map((level) => <option key={level.id} value={level.id}>{level.code} — {level.title}</option>)}
        </select>
      </label>
      {levelId ? (
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-medium">Reason (required if it differs from the recommendation)</span>
          <input value={reason} onChange={(event) => setReason(event.currentTarget.value)} maxLength={500} className="input input-sm w-full rounded-field bg-base-200" />
        </label>
      ) : null}
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[11px] font-medium">Note</span>
        <input value={note} onChange={(event) => setNote(event.currentTarget.value)} maxLength={500} placeholder="e.g. Paper test, oral interview" className="input input-sm w-full rounded-field bg-base-200" />
      </label>
      {error ? <p role="alert" className="text-xs font-medium text-error sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2 sm:flex sm:justify-end">
        <button type="submit" disabled={busy} className="btn btn-sm btn-primary w-full gap-1 rounded-full sm:w-auto">
          {busy ? <span className="loading loading-spinner loading-xs" /> : null}
          Record placement
        </button>
      </div>
    </form>
  );
}
