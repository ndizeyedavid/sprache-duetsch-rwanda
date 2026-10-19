import { FiAlertCircle,FiUserPlus } from 'react-icons/fi';
import { useState } from 'react';
import type { ClassGroupItem } from '../../lib/services';
import type { TeachingTeacher } from '../../lib/teaching';
import type { TeacherActions } from './useTeacherActions';
import { eligibleFor,teacherName } from './utils';

type Props = { classes: ClassGroupItem[]; teachers: TeachingTeacher[]; actions: TeacherActions };

function UnstaffedCard({ group, teachers, actions }: { group: ClassGroupItem; teachers: TeachingTeacher[]; actions: TeacherActions }) {
  const eligible = eligibleFor(group, teachers);
  const anyActive = teachers.filter((teacher) => teacher.status === 'ACTIVE');
  const options = eligible.length ? eligible : anyActive;
  const [teacherId, setTeacherId] = useState('');
  const busy = actions.busyKey === `class:${group.id}`;
  const chosen = options.find((teacher) => teacher.id === teacherId);
  return (
    <li className="flex min-w-64 flex-col gap-2 rounded-box border border-line bg-base-100 p-3">
      <div>
        <p className="truncate text-sm font-semibold">{group.name}</p>
        <p className="truncate text-[0.6875rem] text-muted">{group.level.code} · {group.intake.name} · {group._count.enrollments} students</p>
      </div>
      <div className="flex gap-2">
        <select aria-label={`Teacher for ${group.name}`} value={teacherId} onChange={(event) => setTeacherId(event.target.value)}
          className="select select-sm min-w-0 flex-1 rounded-full border-line bg-base-100 text-xs">
          <option value="">{eligible.length ? 'Choose a teacher' : `No one approved for ${group.level.code} — pick to approve`}</option>
          {options.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacherName(teacher)}</option>)}
        </select>
        <button type="button" disabled={!chosen || busy} onClick={() => chosen && void actions.assignClass(chosen, group)}
          className="btn btn-sm btn-primary rounded-full" aria-label={`Assign teacher to ${group.name}`}>
          {busy ? <span className="loading loading-spinner loading-xs" /> : <FiUserPlus aria-hidden />}
        </button>
      </div>
    </li>
  );
}

/** Classes without a teacher, each fixable in place: pick a name, click once. */
export function UnstaffedClasses({ classes, teachers, actions }: Props) {
  if (!classes.length) return null;
  return (
    <section aria-labelledby="unstaffed-heading" className="rounded-box border border-primary bg-base-100 p-4">
      <h2 id="unstaffed-heading" className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <FiAlertCircle aria-hidden /> {classes.length} class{classes.length === 1 ? '' : 'es'} need a teacher
      </h2>
      <ul className="flex gap-3 overflow-x-auto pb-1">
        {classes.map((group) => <UnstaffedCard key={group.id} group={group} teachers={teachers} actions={actions} />)}
      </ul>
    </section>
  );
}
