import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem } from '../../lib/services';
import { deleteLevel,getLevel } from '../../lib/services';

type LevelDeleteDialogProps = {
  level: LevelItem;
  lessonCount: number;
  onCancel: () => void;
  onDeleted: () => void;
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const joinAnd = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : (items[0] ?? '');

/** Confirms a permanent level delete; blocked while students, classes or certificates use it. */
export function LevelDeleteDialog({ level, lessonCount, onCancel, onDeleted }: LevelDeleteDialogProps) {
  const detail = useApi(`level-usage-${level.id}`, () => getLevel(level.id));
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usage = detail.data?._count;
  const blockers = usage
    ? [
        usage.enrollments ? plural(usage.enrollments, 'enrolled student', 'enrolled students') : null,
        usage.classes ? plural(usage.classes, 'class', 'classes') : null,
        usage.certificates ? plural(usage.certificates, 'certificate', 'certificates') : null,
      ].filter((label): label is string => label !== null)
    : [];
  const confirmed = typed.trim().toUpperCase() === level.code.toUpperCase();

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteLevel(level.id);
      onDeleted();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete the level.'));
      setBusy(false);
    }
  }

  if (detail.loading) {
    return <span className="loading loading-spinner loading-sm" aria-label="Checking level" />;
  }

  return (
    <div className="space-y-4 text-sm">
      {blockers.length > 0 ? (
        <div role="alert" className="alert alert-warning text-xs">
          <span>
            <strong>{level.code}</strong> can't be deleted yet because it still has {joinAnd(blockers)}.
            Move them to another level (or remove them) first. You can still rename it with Edit.
          </span>
        </div>
      ) : (
        <>
          <p className="text-muted">
            This permanently deletes <strong className="text-ink">{level.title}</strong> with its{' '}
            {plural(usage?.modules ?? 0, 'module', 'modules')}, {plural(lessonCount, 'lesson', 'lessons')},
            activities, questions and assessments. This can't be undone.
          </p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">
              Type <strong>{level.code}</strong> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.currentTarget.value)}
              autoComplete="off"
              className="input w-full rounded-field border-line bg-base-100"
            />
          </label>
        </>
      )}
      {error || detail.error ? (
        <p role="alert" className="text-xs text-error">{error ?? detail.error}</p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-sm btn-ghost rounded-full">
          {blockers.length > 0 ? 'Close' : 'Cancel'}
        </button>
        {blockers.length === 0 ? (
          <button
            type="button"
            disabled={!confirmed || busy || !usage}
            onClick={() => void handleDelete()}
            className="btn btn-sm btn-error gap-1 rounded-full text-white disabled:opacity-60"
          >
            {busy ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 aria-hidden />}
            Delete level
          </button>
        ) : null}
      </div>
    </div>
  );
}
