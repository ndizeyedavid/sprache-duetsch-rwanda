import { FiCheck,FiPlus,FiX } from 'react-icons/fi';
import type { IntakeItem } from '../../../lib/services';
import { isoDate } from '../../../lib/services';
import type { TeachingTeacher } from '../../../lib/teaching';
import type { TeacherActions } from '../useTeacherActions';
import { activeClasses,teacherIntakeIds } from '../utils';

type Props = { teacher: TeachingTeacher; intakes: IntakeItem[]; actions: TeacherActions };

const isCurrent = (intake: IntakeItem) => intake.isActive && new Date(intake.endDate).getTime() >= Date.now();

/** Intakes as a plain list: "Add" puts the teacher in that intake; a teacher can be in several. */
export function IntakesSection({ teacher, intakes, actions }: Props) {
  const member = teacherIntakeIds(teacher);
  const rows = intakes.filter((intake) => isCurrent(intake) || member.has(intake.id))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const classCount = (intakeId: string) => activeClasses(teacher).filter((group) => group.intake.id === intakeId).length;
  const active = teacher.status === 'ACTIVE';
  return (
    <section aria-labelledby="intakes-heading">
      <h3 id="intakes-heading" className="text-sm font-semibold">Intakes</h3>
      <p className="mb-3 text-xs text-muted">Click Add to put {teacher.firstName} in an intake. A teacher can work in several intakes.</p>
      {!rows.length ? <p className="rounded-box bg-base-200 p-3 text-xs text-muted">No running or upcoming intakes yet.</p> : null}
      <ul className="space-y-2">
        {rows.map((intake) => {
          const added = member.has(intake.id);
          const classes = classCount(intake.id);
          const busy = actions.busyKey === `intake:${intake.id}`;
          return (
            <li key={intake.id} className={`flex items-center gap-3 rounded-box border p-3 ${added ? 'border-primary' : 'border-line'}`}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{intake.name}</span>
                <span className="block text-[0.6875rem] text-muted">
                  {isoDate(intake.startDate)} – {isoDate(intake.endDate)}{added ? ` · ${classes} class${classes === 1 ? '' : 'es'}` : ''}
                </span>
              </span>
              {added ? (
                <span className="flex shrink-0 items-center gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-content"><FiCheck aria-hidden /> Added</span>
                  <button type="button" disabled={!active || Boolean(actions.busyKey) || classes > 0} onClick={() => void actions.removeIntake(teacher, intake)}
                    title={classes > 0 ? 'Move their classes in this intake to another teacher first' : `Remove from ${intake.name}`}
                    aria-label={`Remove ${teacher.firstName} from ${intake.name}`} className="btn btn-ghost btn-xs btn-circle text-muted">
                    {busy ? <span className="loading loading-spinner loading-xs" /> : <FiX aria-hidden />}
                  </button>
                </span>
              ) : (
                <button type="button" disabled={!active || Boolean(actions.busyKey)} onClick={() => void actions.addIntake(teacher, intake)}
                  className="btn btn-sm btn-primary shrink-0 rounded-full">
                  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
