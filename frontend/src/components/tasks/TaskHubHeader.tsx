import { FiClipboard } from 'react-icons/fi';
import { WORKSPACE_CONTEXT } from '../admin/workspace-context';
import { heroAction } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import { WorkspaceHeroLinks } from '../teacher/WorkspaceHeroLinks';
import { NewTaskMenu } from './NewTaskMenu';
import type { TaskItem, TaskKind } from './task-types';

type Props = { items?: TaskItem[]; admin?: boolean; onCreate: (kind: TaskKind) => void; onFilter: (status: string) => void };

/** Page hero for Assignments: title, three quick counts (each one filters the list) and the New menu. */
export function TaskHubHeader({ items, admin = false, onCreate, onFilter }: Props) {
  const stats: [string, number, string][] = items ? [
    ['Need review', items.reduce((t, i) => t + i.toReview, 0), 'review'],
    ['Drafts', items.filter(i => i.status === 'DRAFT').length, 'DRAFT'],
    ['Published', items.filter(i => i.status === 'PUBLISHED').length, 'PUBLISHED'],
  ] : [];
  return (
    <PageHero eyebrow={admin ? WORKSPACE_CONTEXT.assignments.category : 'Practice & feedback'} icon={FiClipboard} title="Assignments" art="assignments"
      description={admin ? 'Homework, quizzes and tests across every class and level, in one place.' : 'Homework, quizzes and tests for your classes, in one place.'}
      meta={stats.length ? stats.map(([label, count, status]) => (
        <button key={label} type="button" onClick={() => onFilter(status)} aria-label={`Show ${label.toLowerCase()}`}
          className={`hero-chip cursor-pointer ${status === 'review' && count ? 'hero-chip-solid' : 'hover:bg-primary-content hover:text-primary'}`}>
          <strong className="tabular-nums">{count}</strong>{label}
        </button>
      )) : null}
      actions={<>
        <NewTaskMenu onCreate={onCreate} className={heroAction} />
        {admin ? <WorkspaceHeroLinks segment="assignments" /> : null}
      </>} />
  );
}
