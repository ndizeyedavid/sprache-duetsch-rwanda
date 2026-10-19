import { FiArrowLeft,FiAward,FiCheckSquare,FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ClassGroupItem } from '../../../lib/services';
import { humanize } from '../../../lib/services';
import type { ClassGroupDetail } from '../../../lib/services/class-group-detail';
import { heroAction,heroGhost } from '../../hero/hero-actions';
import { PageHero } from '../../hero/PageHero';

type Props = { group?: ClassGroupDetail; classes?: ClassGroupItem[]; classGroupId: string; onSwitch: (id: string) => void };

/** Roster header: which class, its key facts, a class switcher and the class's teaching tools. */
export function PeopleHero({ group, classes, classGroupId, onSwitch }: Props) {
  const count = group?.enrollments.length ?? 0;
  return (
    <PageHero eyebrow="Class roster" icon={FiUsers} art="team"
      title={group?.name ?? 'Class people'}
      description={group ? `${group.level.code} · ${group.intake.name} · ${group.campus.name} · ${humanize(group.shift)}` : 'Everyone enrolled in this class.'}
      meta={group ? <span className="hero-chip">{count} student{count === 1 ? '' : 's'}</span> : null}
      actions={<>
        {classes?.length ? (
          <select value={classGroupId} onChange={event => onSwitch(event.currentTarget.value)} aria-label="Switch class"
            className="select select-sm w-full max-w-xs rounded-full border-primary-content bg-base-100 text-base-content sm:w-auto roomy:select-md">
            {classes.map(item => <option key={item.id} value={item.id}>{item.name} · {item.level.code}</option>)}
          </select>
        ) : null}
        <Link to={`/teacher/attendance?classGroupId=${classGroupId}`} className={heroAction}><FiCheckSquare aria-hidden />Attendance</Link>
        <Link to={`/teacher/grading?classGroupId=${classGroupId}`} className={heroGhost}><FiAward aria-hidden />Grade</Link>
        <Link to="/teacher" className={heroGhost}><FiArrowLeft aria-hidden />Dashboard</Link>
      </>} />
  );
}
