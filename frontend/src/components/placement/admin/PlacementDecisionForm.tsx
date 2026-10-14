import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import type { LevelItem } from '../../../lib/services/level-item';
import { decidePlacement } from '../../../lib/services/placement-api';
import type { StaffPlacementResult } from '../../../lib/services/placement-types';

type Props = { result: StaffPlacementResult; levels: LevelItem[]; onSaved: () => void; onCancel?: () => void };

/** Confirm the recommended level, or override it with a reason (audited). */
export function PlacementDecisionForm({ result, levels, onSaved, onCancel }: Props) {
  const [levelId, setLevelId] = useState(result.assignedLevelId ?? result.recommendedLevelId);
  const [reason, setReason] = useState(result.overrideReason ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const override = levelId !== result.recommendedLevelId;
  const active = levels.filter((level) => level.isActive || level.id === levelId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (override && !reason.trim()) {
      setError('Give a reason for choosing a different level than recommended.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await decidePlacement(result.studentId, result.id, { assignedLevelId: levelId, overrideReason: override ? reason.trim() : undefined });
      onSaved();
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Could not save the decision.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-field bg-base-200 p-3">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium">Assigned level</span>
        <select value={levelId} onChange={(event) => setLevelId(event.currentTarget.value)} className="select select-sm w-full rounded-field bg-base-100">
          {active.map((level) => (
            <option key={level.id} value={level.id}>
              {level.code} — {level.title}{level.id === result.recommendedLevelId ? ' (recommended)' : ''}
            </option>
          ))}
        </select>
      </label>
      {override ? (
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium">Reason for override (required)</span>
          <textarea required value={reason} onChange={(event) => setReason(event.currentTarget.value)} rows={2} maxLength={500} placeholder="e.g. Strong speaking in the interview, weak grammar" className="textarea textarea-sm w-full rounded-field bg-base-100" />
        </label>
      ) : null}
      {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">Cancel</button> : null}
        <button type="submit" disabled={busy} className="btn btn-sm btn-primary gap-1 rounded-full">
          {busy ? <span className="loading loading-spinner loading-xs" /> : null}
          {override ? 'Save override' : `Confirm ${result.recommendedLevel.code}`}
        </button>
      </div>
    </form>
  );
}
