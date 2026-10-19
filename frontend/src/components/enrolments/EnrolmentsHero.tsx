import { FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

const context = WORKSPACE_CONTEXT.enrolments;

/** Red page header for the enrolment register; "Enrol a student" opens the same create dialog. */
export function EnrolmentsHero({ onCreate }: { onCreate: () => void }) {
  return (
    <PageHero
      eyebrow={context.category}
      icon={context.icon}
      title="Enrolments"
      description="Who studies which level, in which intake and class. Enrolling a student also creates their configured tuition charge."
      art="placement"
      scoped
      actions={
        <>
          <button type="button" className={heroAction} onClick={onCreate}>
            <FiUserPlus aria-hidden /> Enrol a student
          </button>
          {context.links.map((link) => (
            <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>
          ))}
        </>
      }
    />
  );
}
