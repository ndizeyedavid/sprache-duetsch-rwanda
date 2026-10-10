import { useEffect,useState } from 'react';
import { FiCheck,FiLock } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem } from '../../lib/services';
import { humanize } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { assignTeachingLevels } from '../../lib/teaching';
import { StatusBadge } from '../ui/StatusBadge';
import { SUN_BADGE } from './constants';
import { LevelApprovalChips } from './LevelApprovalChips';
import { LevelSaveFeedback } from './LevelSaveFeedback';
import {
conflictClassName,
teacherClassCount,
teacherInitials,
teacherStudentCount,
} from './utils';

type TeacherLevelsCardProps = {
  teacher: TeachingTeacher;
  levels: LevelItem[];
  /** Joined approved level ids — changes only when the server data changes. */
  approvedKey: string;
  saved: boolean;
  onSaved: (teacherId: string) => void;
  onRevealClass: (className: string) => void;
};

/**
 * Step 1 of the page: which levels this teacher may teach. Editing is local until
 * saved; the parent's refetch is what resyncs the chips from the server.
 */
export function TeacherLevelsCard({
  teacher,
  levels,
  approvedKey,
  saved,
  onSaved,
  onRevealClass,
}: TeacherLevelsCardProps) {
  const [selected, setSelected] = useState<string[]>(() => approvedKey.split(',').filter(Boolean));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(approvedKey.split(',').filter(Boolean));
  }, [approvedKey]);

  const active = teacher.status === 'ACTIVE';
  const locked = saving || !active;
  const approved = approvedKey.split(',').filter(Boolean);
  const changed =
    selected.length !== approved.length || selected.some((id) => !approved.includes(id));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await assignTeachingLevels(teacher.id, selected);
      onSaved(teacher.id);
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Could not save these levels. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="learning-panel flex flex-col rounded-box p-5">
      <div className="flex items-start gap-3">
        <div className="avatar avatar-placeholder">
          <div className="w-11 rounded-xl bg-neutral text-neutral-content">
            <span className="text-xs font-semibold">{teacherInitials(teacher)}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <p className="truncate text-xs text-muted">{teacher.email}</p>
        </div>
        <StatusBadge status={humanize(teacher.status)} />
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span>
          <span className="font-semibold tabular-nums text-ink">
            {teacherClassCount(teacher)}
          </span>{' '}
          active classes
        </span>
        <span>
          <span className="font-semibold tabular-nums text-ink">
            {teacherStudentCount(teacher)}
          </span>{' '}
          students
        </span>
      </p>

      {!active ? (
        <p
          className={`mt-4 flex items-start gap-2 rounded-box px-3 py-2 text-xs leading-5 ${SUN_BADGE}`}
        >
          <FiLock aria-hidden className="mt-0.5 shrink-0" />
          Only active teacher accounts can hold teaching levels.
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Approved levels
        </p>
        <span className="rounded-full bg-base-200 px-2 py-0.5 text-xs font-semibold tabular-nums text-ink">
          {selected.length}
        </span>
      </div>
      <LevelApprovalChips
        levels={levels}
        selected={selected}
        disabled={locked}
        onToggle={(levelId) =>
          setSelected((current) =>
            current.includes(levelId)
              ? current.filter((id) => id !== levelId)
              : [...current, levelId],
          )
        }
      />

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-[11px] leading-4 text-muted">
          Levels unlock curriculum &amp; assessments.
        </p>
        <button
          type="button"
          disabled={locked || !changed}
          onClick={() => void save()}
          className="btn btn-sm shrink-0 rounded-full"
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <FiCheck aria-hidden />
          )}
          Save levels
        </button>
      </div>

      <LevelSaveFeedback
        error={error}
        saved={saved && !error}
        conflictClass={error ? conflictClassName(error) : null}
        onRevealClass={onRevealClass}
      />
    </article>
  );
}