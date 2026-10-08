import { IntakeLevelPicker } from './IntakeLevelPicker';
import type { ChangeEvent,FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { IntakeItem } from '../../lib/services';
import { FIELD,PRIMARY_BTN } from './constants';
import type { IntakeDraft } from './types';
import { emptyDraft,toDraft,toIsoDate,withStartDate } from './utils';

type IntakeFormProps = {
  /** Existing intake when editing; omit to create. */
  initial?: IntakeItem;
  onSubmit: (values: Record<string, unknown>) => Promise<unknown>;
  onDone: () => void;
  onCancel?: () => void;
};

function validate(draft: IntakeDraft): string | null {
  if (!draft.startDate || !draft.endDate) return 'Both course dates are required.';
  if (draft.endDate <= draft.startDate) return 'The course must end after it starts.';
  if (draft.enrollmentOpensAt && draft.enrollmentEndsAt) {
    if (draft.enrollmentEndsAt <= draft.enrollmentOpensAt) {
      return 'Registration must close after it opens.';
    }
  }
  return null;
}

export function IntakeForm({ initial, onSubmit, onDone, onCancel }: IntakeFormProps) {
  const [levelIds, setLevelIds] = useState(initial?.levels?.map(level => level.id) ?? []);
  const [draft, setDraft] = useState<IntakeDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read the value synchronously: React 19 runs `setDraft` updaters after the
  // event has been dispatched, when `event.currentTarget` is already null.
  const set = (key: keyof IntakeDraft) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const setStartDate = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setDraft((current) => withStartDate(current, value, !initial));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = validate(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const values: Record<string, unknown> = {
        name: draft.name.trim(),
        startDate: toIsoDate(draft.startDate),
        endDate: toIsoDate(draft.endDate),
        enrollmentOpensAt: draft.enrollmentOpensAt ? toIsoDate(draft.enrollmentOpensAt) : null,
        enrollmentEndsAt: draft.enrollmentEndsAt ? toIsoDate(draft.enrollmentEndsAt) : null,
        levelIds,
        isActive: draft.isActive,
      };
      // The code is derived from the start month on create and frozen on edit.
      if (!initial) values.code = draft.code;
      await onSubmit(values);
      if (!initial) setDraft(emptyDraft());
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err, initial ? 'Could not save the intake.' : 'Could not create the intake.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className={initial ? 'grid gap-3 sm:grid-cols-2' : 'block'}>
        <legend className="sr-only">Intake details</legend>
        {initial ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Code</span>
            <input
              readOnly
              tabIndex={-1}
              value={draft.code}
              className={`${FIELD} font-mono text-muted`}
            />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Name</span>
          <input
            required
            minLength={2}
            maxLength={120}
            value={draft.name}
            onChange={set('name')}
            placeholder="e.g. Intake September 2026"
            className={FIELD}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold">Course window</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Starts</span>
            <input required type="date" value={draft.startDate} onChange={setStartDate} className={FIELD} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Ends</span>
            <input required type="date" value={draft.endDate} onChange={set('endDate')} className={FIELD} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold">Registration window</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Opens</span>
            <input type="date" value={draft.enrollmentOpensAt} onChange={set('enrollmentOpensAt')} className={FIELD} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Closes</span>
            <input type="date" value={draft.enrollmentEndsAt} onChange={set('enrollmentEndsAt')} className={FIELD} />
          </label>
        </div>
      </fieldset>

      <IntakeLevelPicker selected={levelIds} onChange={setLevelIds} />

      <label className="flex items-center gap-3 rounded-field bg-base-200 px-3 py-2.5">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) => {
            const isActive = event.currentTarget.checked;
            setDraft((current) => ({ ...current, isActive }));
          }}
          className="toggle toggle-primary"
        />
        <span className="text-xs font-medium">
          Open for enrolment and scheduling
          <span className="block text-[11px] text-muted">
            Archived intakes stay readable but cannot take new registrations.
          </span>
        </span>
      </label>

      {error ? <p role="alert" className="text-xs font-medium text-error">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={busy} className={PRIMARY_BTN}>
          {busy ? <span className="loading loading-spinner loading-xs" /> : null}
          {initial ? 'Save changes' : 'Create intake'}
        </button>
      </div>
    </form>
  );
}
