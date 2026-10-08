import type { ChangeEvent,FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem } from '../../lib/services';
import { LevelCompletionFields } from './LevelCompletionFields';

export type LevelFormValues = {
  code: string;
  levelLabel: string;
  title: string;
  defaultFee?: number;
  order: number;
  coursebookUrl: string | null;
  coursebookPages: number | null;
  completionRules: { minimumAttendance: number; requireHomework: boolean; homeworkPassMark: number };
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
  coursebookUrl: level?.coursebookUrl ?? '', coursebookPages: String(level?.coursebookPages ?? ''),
  minimumAttendance: String(level?.completionRules?.minimumAttendance ?? 0), requireHomework: level?.completionRules?.requireHomework ?? false, homeworkPassMark: String(level?.completionRules?.homeworkPassMark ?? 50),
  code: level?.code ?? '',
  levelLabel: level?.levelLabel ?? '',
  title: level?.title ?? '',
  defaultFee: level ? String(Number(level.defaultFee)) : '',
  order: level ? String(level.order) : '',
});

export function LevelForm({ initial, submitLabel, onSubmit, onDone, onCancel }: LevelFormProps) {
  const [draft, setDraft] = useState(() => toDraft(initial));
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = (key: "code" | "levelLabel" | "title" | "defaultFee" | "order") => ({
    value: draft[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setDraft((current) => ({ ...current, [key]: value }));
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploading) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        coursebookUrl: draft.coursebookUrl || null, coursebookPages: draft.coursebookPages ? Number(draft.coursebookPages) : null,
        completionRules: { minimumAttendance: Number(draft.minimumAttendance), requireHomework: draft.requireHomework, homeworkPassMark: Number(draft.homeworkPassMark) },
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
          <span className="mb-1.5 block text-xs font-medium">Course price ({initial?.currency ?? 'RWF'})</span>
          <input {...field('defaultFee')} type="number" min="0" step={initial?.currency === 'RWF' || !initial ? '1' : '0.01'} inputMode="numeric" placeholder="e.g. 45000" className={INPUT} />
          <span className="mt-1 block text-xs text-base-content/60">Used for new enrollments. Existing students keep their enrolled price.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Position in list</span>
          <input {...field('order')} inputMode="numeric" placeholder="e.g. 1" className={INPUT} />
        </label>
      </div>
      <LevelCompletionFields onBusyChange={setUploading} value={draft} onChange={value => setDraft(current => ({ ...current, ...value }))} />
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy || uploading}
          className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? <span className="loading loading-spinner loading-xs" /> : null} {submitLabel}
        </button>
      </div>
    </form>
  );
}
