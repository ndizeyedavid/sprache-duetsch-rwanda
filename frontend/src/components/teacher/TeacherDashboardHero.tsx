import { FiArrowUpRight,FiCalendar,FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Props = { name?: string; classes?: number; toReview?: number };

/** Teacher home header: greeting, today's date and the two places teachers go most. */
export function TeacherDashboardHero({ name, classes, toReview }: Props) {
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <PageHero eyebrow="Teaching overview" icon={FiSun} art="teaching" scoped
      title={`Hallo${name ? `, ${name}` : ''}.`}
      description={`${date} — your classes, work to review and the next lessons at a glance.`}
      meta={<>
        {classes !== undefined ? <span className="hero-chip">{classes} active {classes === 1 ? 'class' : 'classes'}</span> : null}
        {toReview ? <span className="hero-chip hero-chip-solid">{toReview} to review</span> : null}
      </>}
      actions={<>
        <Link to="/teacher/schedule" className={heroAction}><FiCalendar aria-hidden />Schedule <FiArrowUpRight aria-hidden /></Link>
        <Link to="/teacher/assignments" className={heroGhost}>Assignments</Link>
      </>} />
  );
}
