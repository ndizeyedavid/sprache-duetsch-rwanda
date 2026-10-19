import { FiChevronRight,FiUserCheck } from 'react-icons/fi';
import type { TeachingTeacher } from '../../lib/teaching';
import { StatusBadge } from '../ui/StatusBadge';
import { TeacherAvatar } from './TeacherAvatar';
import { activeClasses,statusLabel,studentLoad,teacherIntakeIds,teacherName } from './utils';

type Props = { teacher: TeachingTeacher; activating: boolean; onOpen: () => void; onActivate: () => void };

/** One teacher at a glance: levels, classes per intake, load — click anywhere to manage. */
export function TeacherListRow({ teacher, activating, onOpen, onActivate }: Props) {
  const classes = activeClasses(teacher);
  const intakes = teacher.teachingIntakes.filter((row) => teacherIntakeIds(teacher).has(row.intakeId));
  const intakeCount = teacherIntakeIds(teacher).size;
  const pending = teacher.status === 'PENDING';
  return (
    <li className="flex flex-col gap-3 border-b border-line p-4 last:border-0 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <TeacherAvatar teacher={teacher} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{teacherName(teacher)}</span>
            {teacher.status !== 'ACTIVE' ? <StatusBadge status={statusLabel(teacher.status)} className="!px-2.5 !py-0.5" /> : null}
          </span>
          <span className="block truncate text-xs text-muted">{teacher.email}</span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {teacher.teachingLevels.length ? teacher.teachingLevels.map((row) => (
              <span key={row.levelId} className="rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-semibold text-primary-content">{row.level.code}</span>
            )) : <span className="text-[0.6875rem] text-muted">No levels yet</span>}
          </span>
        </span>
      </button>
      <div className="flex items-center gap-4 sm:w-72 sm:justify-end">
        <dl className="grid flex-1 grid-cols-3 gap-2 text-center sm:flex-none">
          <div><dt className="text-[0.625rem] uppercase tracking-wide text-muted">Classes</dt><dd className="text-base font-bold tabular-nums">{classes.length}</dd></div>
          <div><dt className="text-[0.625rem] uppercase tracking-wide text-muted">Students</dt><dd className="text-base font-bold tabular-nums">{studentLoad(teacher)}</dd></div>
          <div><dt className="text-[0.625rem] uppercase tracking-wide text-muted">Intakes</dt><dd className="text-base font-bold tabular-nums" title={intakes.map((row) => row.intake.name).join(', ')}>{intakeCount}</dd></div>
        </dl>
        {pending ? (
          <button type="button" disabled={activating} onClick={onActivate} className="btn btn-sm btn-primary shrink-0 rounded-full">
            {activating ? <span className="loading loading-spinner loading-xs" /> : <FiUserCheck aria-hidden />} Activate
          </button>
        ) : (
          <button type="button" onClick={onOpen} className="btn btn-sm shrink-0 rounded-full border-line bg-base-100">
            Manage <FiChevronRight aria-hidden />
          </button>
        )}
      </div>
    </li>
  );
}
