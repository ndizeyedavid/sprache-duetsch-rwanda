import { useState } from 'react';
import { FiUserMinus,FiUsers } from 'react-icons/fi';
import type { TeachingTeacher } from '../../../lib/teaching';
import type { TeacherActions } from '../useTeacherActions';
import { activeClasses,groupByIntake } from '../utils';

type Props = { teacher: TeachingTeacher; actions: TeacherActions };

/** The classes this teacher runs, grouped by intake; removing one takes two taps so it is never accidental. */
export function ClassesSection({ teacher, actions }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const groups = groupByIntake(activeClasses(teacher));
  return (
    <section aria-labelledby="classes-heading">
      <h3 id="classes-heading" className="text-sm font-semibold">Classes they teach</h3>
      {!groups.length ? <p className="mt-2 rounded-box bg-base-200 p-3 text-xs text-muted">No classes yet — give one below.</p> : null}
      {groups.map(({ intake, classes }) => (
        <div key={intake.id} className="mt-3">
          <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">{intake.name}</p>
          <ul className="space-y-2">
            {classes.map((group) => {
              const busy = actions.busyKey === `class:${group.id}`;
              const confirming = confirmId === group.id;
              return (
                <li key={group.id} className="flex items-center gap-3 rounded-box border border-line p-3">
                  <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-field bg-primary px-1.5 text-[0.625rem] font-bold text-primary-content">{group.level.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{group.name}</span>
                    <span className="flex items-center gap-1 text-[0.6875rem] text-muted"><FiUsers aria-hidden />{group._count.enrollments}/{group.capacity} · {group.campus.name}</span>
                  </span>
                  <button type="button" disabled={busy} onBlur={() => setConfirmId(null)}
                    onClick={() => (confirming ? void actions.unassignClass(group).then(() => setConfirmId(null)) : setConfirmId(group.id))}
                    className={`btn btn-xs shrink-0 rounded-full ${confirming ? 'btn-error' : 'btn-ghost text-error'}`}>
                    {busy ? <span className="loading loading-spinner loading-xs" /> : <FiUserMinus aria-hidden />}
                    {confirming ? 'Confirm' : 'Remove'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
