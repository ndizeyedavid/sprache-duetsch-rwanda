import { FiBarChart2,FiCheckSquare,FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Props = { classes?: number; attempts?: number; exporting?: boolean; onExport?: () => void };

/** Teacher analytics header: what the page shows, how much data is in view and the CSV export. */
export function TeacherReportsHero({ classes, attempts, exporting = false, onExport }: Props) {
  return (
    <PageHero eyebrow="Class insights" icon={FiBarChart2} title="Reports" art="reports" scoped
      description="Performance analytics: filter by date, class and assessment to see trends, score spread and every student."
      meta={<>
        {classes !== undefined ? <span className="hero-chip">{classes} {classes === 1 ? 'class' : 'classes'}</span> : null}
        {attempts !== undefined ? <span className="hero-chip">{attempts} attempt{attempts === 1 ? '' : 's'} in view</span> : null}
      </>}
      actions={<>
        {onExport ? (
          <button type="button" disabled={exporting} onClick={onExport} className={heroAction}>
            {exporting ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <FiDownload aria-hidden />}Export CSV
          </button>
        ) : null}
        <Link to="/teacher/grading" className={heroGhost}><FiCheckSquare aria-hidden />Grading</Link>
      </>} />
  );
}
