import { FiAward,FiBarChart2,FiClipboard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { useStaffPortal } from '../teacher/useStaffPortal';

/** SpeedGrader header: how much is waiting, plus the pages grading work comes from and feeds into. */
export function GradingHero({ pending, loaded }: { pending: number; loaded: boolean }) {
  const { admin, portal } = useStaffPortal();
  return (
    <PageHero eyebrow={admin ? 'Practice & feedback' : 'SpeedGrader'} icon={FiAward} title="Grading" art="grades" scoped
      description={admin ? 'Every submitted quiz, test and lesson activity across your classes. Filter, grade and hit Save & next.' : 'Queue on the left, grading canvas on the right. Filter by class or assessment, then grade and hit Save & next.'}
      meta={loaded ? <span className={`hero-chip ${pending ? 'hero-chip-solid' : ''}`}>{pending} to grade</span> : null}
      actions={<>
        <Link to={`${portal}/assignments`} className={heroGhost}><FiClipboard aria-hidden />Assignments</Link>
        <Link to={`${portal}/reports`} className={heroGhost}><FiBarChart2 aria-hidden />Reports</Link>
      </>} />
  );
}
