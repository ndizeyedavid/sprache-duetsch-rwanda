import { FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

const context = WORKSPACE_CONTEXT.teachers;

type Props = { stats: { teachers: number; active: number; pending: number; unstaffed: number } | null; onAdd: () => void };

/** Red header for the Teachers page: add a teacher, see who needs attention at a glance. */
export function TeachersHero({ stats, onAdd }: Props) {
  return (
    <PageHero
      eyebrow={context.category}
      icon={context.icon}
      title="Teachers"
      description="Add teachers, choose the levels they teach and give them classes in each intake — one click each."
      art="teaching"
      scoped
      meta={stats ? (
        <>
          <span className="hero-chip">{stats.teachers} teacher{stats.teachers === 1 ? '' : 's'}</span>
          <span className="hero-chip">{stats.active} active</span>
          {stats.pending ? <span className="hero-chip hero-chip-solid">{stats.pending} waiting to be activated</span> : null}
          {stats.unstaffed ? <span className="hero-chip hero-chip-solid">{stats.unstaffed} class{stats.unstaffed === 1 ? '' : 'es'} need a teacher</span> : null}
        </>
      ) : null}
      actions={
        <>
          <button type="button" className={heroAction} onClick={onAdd}><FiUserPlus aria-hidden /> Add teacher</button>
          {context.links.map((link) => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)}
        </>
      }
    />
  );
}
