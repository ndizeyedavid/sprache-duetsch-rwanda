import { FiCheck,FiUserPlus } from 'react-icons/fi';
import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import { StatusBadge } from '../ui/StatusBadge';
import { ClassCoverageNote } from './ClassCoverageNote';
import { useClassTeacherSave } from './useClassTeacherSave';
import { eligibleTeachers } from './utils';

type ClassTeacherRowProps = {
  group: ClassGroupItem;
  teachers: TeachingTeacher[];
  highlighted?: boolean;
  onSaved: () => void;
};

const fullName = (teacher: TeachingTeacher): string => `${teacher.firstName} ${teacher.lastName}`;

/**
 * Step 2 of the page: who runs this class. The eligible list is narrowed to
 * active teachers approved for the class's level, matching the backend rule.
 */
export function ClassTeacherRow({
  group,
  teachers,
  highlighted = false,
  onSaved,
}: ClassTeacherRowProps) {
  const { id, setId, saving, error, changed, saved, save } = useClassTeacherSave(group, onSaved);
  const eligible = eligibleTeachers(group, teachers);
  const assigned = teachers.find((teacher) => teacher.id === group.teacherId);
  const unapprovedCurrent = Boolean(
    group.teacherId && !eligible.some((teacher) => teacher.id === group.teacherId),
  );
  // Keeps the current value selectable while making the reason unmissable.
  const currentLabel = !assigned
    ? 'Previous teacher — no longer on staff'
    : `${fullName(assigned)} — ${assigned.status === 'ACTIVE' ? 'level not approved' : 'account inactive'}`;

  return (
    <li
      className={`flex flex-col gap-3 border-b border-line p-4 last:border-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-5 ${
        highlighted ? 'bg-brand text-primary-content ring-2 ring-brand ring-inset' : ''
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
          {!group.isActive ? <StatusBadge status="Inactive" /> : null}
        </div>
        <p className="mt-1 text-xs text-muted">
          <span className="font-medium text-ink">{group.code}</span> · {group.level.code} ·{' '}
          {group.campus.name} · {group.intake.name}
        </p>
        <p className="mt-1 text-xs text-muted">
          <span className="font-medium tabular-nums text-ink">{group._count.enrollments}</span>{' '}
          enrolments
        </p>
        <ClassCoverageNote
          blocked={eligible.length === 0}
          unapprovedCurrent={unapprovedCurrent}
          eligibleCount={eligible.length}
          active={group.isActive}
        />
      </div>

      <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-80 lg:items-end">
        <div className="flex w-full flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`class-teacher-${group.id}`}>
            Teacher for {group.name}
          </label>
          <select
            id={`class-teacher-${group.id}`}
            disabled={saving}
            value={id}
            onChange={(event) => setId(event.target.value)}
            className="select select-sm min-w-0 flex-1 rounded-full border-line bg-base-100 text-xs lg:w-56 lg:flex-none"
          >
            <option value="">Unassigned</option>
            {unapprovedCurrent ? <option value={group.teacherId!}>{currentLabel}</option> : null}
            {eligible.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {fullName(teacher)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !changed}
            className="btn btn-sm shrink-0 rounded-full"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : changed ? (
              <FiUserPlus aria-hidden />
            ) : saved ? (
              <FiCheck aria-hidden />
            ) : null}
            {saving ? 'Saving…' : changed ? 'Assign teacher' : saved ? 'Assigned' : 'Assign teacher'}
          </button>
        </div>
        {error ? (
          <p role="alert" className="max-w-md text-xs leading-5 text-error lg:text-right">
            {error}
          </p>
        ) : null}
      </div>
    </li>
  );
}