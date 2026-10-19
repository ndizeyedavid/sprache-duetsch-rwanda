import type { ReactNode } from 'react';
import { FiBookOpen,FiClipboard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { LevelItem } from '../../lib/services';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { WorkspaceHeroLinks } from '../teacher/WorkspaceHeroLinks';

type Props = {
  academic?: boolean; level?: LevelItem; levels?: LevelItem[]; onLevel?: (id: string) => void;
  modules?: number; lessons?: number; compact?: boolean; actions?: ReactNode;
};

/** Course studio header (the level picker sits in the actions) for teachers (their levels) and academic staff (every level, plus level admin actions). */
export function CourseStudioHero({ academic = false, level, levels, onLevel, modules, lessons, compact, actions }: Props) {
  return (
    <PageHero compact={compact} icon={FiBookOpen} art="courses" title="Course studio"
      eyebrow={academic ? WORKSPACE_CONTEXT.courses.category : 'Teaching workspace'}
      description={academic ? 'Build each level’s own curriculum: modules, lessons and activities.' : 'Good lessons start here: choose a module and make it your own.'}
      meta={level && modules !== undefined ? <>
        <span className="hero-chip">{modules} module{modules === 1 ? '' : 's'}</span>
        <span className="hero-chip">{lessons ?? 0} lesson{lessons === 1 ? '' : 's'}</span>
      </> : null}
      actions={<>
        {level && levels && onLevel ? (
          <select aria-label="Choose course" value={level.id} onChange={event => onLevel(event.target.value)}
            className="select select-sm w-full max-w-xs rounded-full border-primary-content bg-base-100 text-base-content sm:w-auto roomy:select-md">
            {levels.map(item => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}
          </select>
        ) : null}
        {actions}
        {academic ? <WorkspaceHeroLinks segment="courses" /> : <Link to="/teacher/assignments" className={heroGhost}><FiClipboard aria-hidden />Assignments</Link>}
      </>} />
  );
}
