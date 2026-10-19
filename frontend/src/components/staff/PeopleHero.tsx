import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

const context = WORKSPACE_CONTEXT.people;

type Props = { isSuper: boolean; creating: boolean; onCreate: () => void };

/** Red page header for the staff directory; "Add staff account" opens the same create dialog. */
export function PeopleHero({ isSuper, creating, onCreate }: Props) {
  return (
    <PageHero
      eyebrow={context.category}
      icon={context.icon}
      title="People"
      description={isSuper
        ? 'Staff accounts for teachers, academic, finance and super admins. Create accounts, change roles and reset passwords.'
        : 'Staff accounts for your school team. Create teacher accounts and keep their profiles up to date.'}
      art="team"
      actions={
        <>
          <button type="button" onClick={onCreate} disabled={creating}
            className={`${heroAction} disabled:border-primary-content disabled:bg-primary-content disabled:text-primary`}>
            {creating ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add staff account
          </button>
          {context.links.map((link) => (
            <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>
          ))}
        </>
      }
    />
  );
}
