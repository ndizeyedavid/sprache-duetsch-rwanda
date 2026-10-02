import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem } from '../../lib/services';

export type LevelFormValues = {
  code: string;
  levelLabel: string;
  title: string;
  defaultFee: number;
  order: number;
};

type LevelFormProps = {
  /** Existing level when editing; omit to create. */
  initial?: LevelItem;
  submitLabel: string;
  onSubmit: (values: LevelFormValues) => Promise<unknown>;
  onDone: () => void;
  onCancel?: () => void;
};

const INPUT = 'input w-full rounded-field border-line bg-base-100';

const toDraft = (level?: LevelItem) => ({
  code: level?.code ?? '',
  levelLabel: level?.levelLabel ?? '',
  title: level?.title ?? '',
  defaultFee: level ? String(Number(level.defaultFee)) : '',
  order: level ? String(level.order) : '',
});

export function LevelForm({ initial, submitLabel, onSubmit, onDone, onCancel }: LevelFormProps) {
  const [draft, setDraft] = useState(() => toDraft(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = (key: keyof typeof draft) => ({
    value: draft[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setDraft((current) => ({ ...current, [key]: value }));
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        code: draft.code.trim().toUpperCase(),
        levelLabel: draft.levelLabel.trim(),
        title: draft.title.trim(),
        defaultFee: Number(draft.defaultFee) || 0,
        order: Number(draft.order) || 0,
      });
      if (!initial) setDraft(toDraft());
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err, initial ? 'Could not save the level.' : 'Could not create the level.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Code</span>
          <input required {...field('code')} placeholder="e.g. A1" className={INPUT} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Label</span>
          <input required {...field('levelLabel')} placeholder="e.g. Beginner" className={INPUT} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium">Title</span>
        <input required minLength={2} {...field('title')} placeholder="e.g. German A1 — Beginner" className={INPUT} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Default fee (RWF)</span>
          <input {...field('defaultFee')} inputMode="numeric" placeholder="e.g. 45000" className={INPUT} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Position in list</span>
          <input {...field('order')} inputMode="numeric" placeholder="e.g. 1" className={INPUT} />
        </label>
      </div>
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? <span className="loading loading-spinner loading-xs" /> : null} {submitLabel}
        </button>
      </div>
    </form>
  );
}
