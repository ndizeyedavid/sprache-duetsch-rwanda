import { FiBookOpen,FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

/** Notes header: what lives here and how many files the student has. */
export function NotesHero({ total }: { total?: number }) {
  return (
    <PageHero
      eyebrow="Notizen · Study notes"
      icon={FiFileText}
      title="My notes"
      description="Every lesson note, PDF, worksheet and slide deck for your level — searchable in one place."
      art="notes"
      meta={total !== undefined ? <span className="hero-chip hero-chip-solid">{total} {total === 1 ? 'file' : 'files'}</span> : null}
      actions={<Link to="/courses" className={heroGhost}><FiBookOpen aria-hidden />My courses</Link>}
    />
  );
}
