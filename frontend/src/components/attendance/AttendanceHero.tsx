import { FiCalendar,FiCheckSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { WorkspaceHeroLinks } from '../teacher/WorkspaceHeroLinks';

type Props = { admin?: boolean; held?: number; unsaved?: number };

/** Attendance header for teachers and academic admins (same register, different related pages). */
export function AttendanceHero({ admin = false, held, unsaved = 0 }: Props) {
  return (
    <PageHero eyebrow={admin ? WORKSPACE_CONTEXT.attendance.category : 'Class register'} icon={FiCheckSquare} title="Attendance" art="attendance" scoped
      description={admin ? 'Choose any class session, check who was there and correct the register.' : 'Choose a session, mark everyone present, late, absent or excused, then save.'}
      meta={<>
        {held !== undefined ? <span className="hero-chip">{held} session{held === 1 ? '' : 's'} held</span> : null}
        {unsaved ? <span className="hero-chip hero-chip-solid">{unsaved} unsaved {unsaved === 1 ? 'change' : 'changes'}</span> : null}
      </>}
      actions={admin ? <WorkspaceHeroLinks segment="attendance" /> : <>
        <Link to="/teacher/schedule" className={heroGhost}><FiCalendar aria-hidden />Schedule</Link>
        <Link to="/teacher/classes" className={heroGhost}>My classes</Link>
      </>} />
  );
}
