import type { ReactNode } from 'react';
import { FiBookOpen } from 'react-icons/fi';
import type { LevelItem } from '../../../lib/services';
import { WORKSPACE_CONTEXT } from '../../admin/workspace-context';
import { PageHero } from '../../hero/PageHero';
import { WorkspaceHeroLinks } from '../../teacher/WorkspaceHeroLinks';

/** Header of the admin course catalogue. */
export function CoursesHero({ levels, actions }: { levels?: LevelItem[]; actions?: ReactNode }) {
  const live = levels?.filter((level) => level.isActive).length ?? 0;
  return (
    <PageHero eyebrow={WORKSPACE_CONTEXT.courses.category} icon={FiBookOpen} title="Courses" art="courses" scoped
      description="Every level is its own course with its own curriculum. Open one to build its modules, lessons and activities."
      meta={levels ? <>
        <span className="hero-chip hero-chip-solid">{levels.length} course{levels.length === 1 ? '' : 's'}</span>
        <span className="hero-chip">{live} open to students</span>
      </> : null}
      actions={<>{actions}<WorkspaceHeroLinks segment="courses" /></>} />
  );
}
