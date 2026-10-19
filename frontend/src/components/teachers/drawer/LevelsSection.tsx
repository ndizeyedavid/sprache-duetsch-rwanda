import { FiCheck } from 'react-icons/fi';
import type { LevelItem } from '../../../lib/services';
import type { TeachingTeacher } from '../../../lib/teaching';
import type { TeacherActions } from '../useTeacherActions';
import { activeClasses,approvedLevelIds } from '../utils';

type Props = { teacher: TeachingTeacher; levels: LevelItem[]; actions: TeacherActions };

/** Levels this teacher may teach (unlocks curriculum + assessments). Each tile saves on click. */
export function LevelsSection({ teacher, levels, actions }: Props) {
  const approved = approvedLevelIds(teacher);
  const inClass = new Set(activeClasses(teacher).map((group) => group.levelId));
  const active = teacher.status === 'ACTIVE';
  const shown = levels.filter((level) => level.isActive || approved.includes(level.id));
  return (
    <section aria-labelledby="levels-heading">
      <h3 id="levels-heading" className="text-sm font-semibold">Levels they teach</h3>
      <p className="mb-3 text-xs text-muted">Tap a level to add or remove it. It unlocks that level's lessons, homework and tests.</p>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((level) => {
          const on = approved.includes(level.id);
          const busy = actions.busyKey === `level:${teacher.id}:${level.id}`;
          return (
            <button key={level.id} type="button" aria-pressed={on} disabled={!active || Boolean(actions.busyKey)} title={level.title}
              onClick={() => void actions.toggleLevel(teacher, level.id, level.code)}
              className={`relative flex min-w-0 flex-col items-start rounded-box border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                on ? 'border-primary bg-primary text-primary-content' : 'border-line bg-base-100 hover:border-primary'}`}>
              <span className={`absolute right-2 top-2 flex size-5 items-center justify-center rounded-full ${on ? 'bg-base-100 text-primary' : 'border border-line'}`} aria-hidden>
                {busy ? <span className="loading loading-spinner loading-xs" /> : on ? <FiCheck className="text-xs" /> : null}
              </span>
              <span className={`pr-6 font-bold ${level.code.length > 4 ? 'text-xs' : 'text-sm'}`}>{level.code}</span>
              <span className={`w-full truncate text-[0.625rem] ${on ? '' : 'text-muted'}`}>{level.levelLabel || level.title}</span>
              {inClass.has(level.id) ? <span className={`mt-1 rounded-full px-1.5 text-[0.5625rem] font-semibold uppercase ${on ? 'bg-base-100 text-primary' : 'bg-base-200 text-muted'}`}>In class</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
