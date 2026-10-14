import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssignmentReview } from '../../components/assignments/teacher/AssignmentReview';
import { useAssignmentActions } from '../../components/assignments/teacher/useAssignmentActions';
import { ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { TaskStudio } from '../../components/tasks/studio/TaskStudio';
import type { Filters } from '../../components/tasks/task-filters';
import { applyFilters } from '../../components/tasks/task-filters';
import { TaskFilters } from '../../components/tasks/TaskFilters';
import { TaskHubHeader } from '../../components/tasks/TaskHubHeader';
import { TaskRow } from '../../components/tasks/TaskRow';
import type { TaskItem, TaskKind } from '../../components/tasks/task-types';
import { KINDS } from '../../components/tasks/task-types';
import { useAssessmentActions } from '../../components/tasks/useAssessmentActions';
import { useTaskHub } from '../../components/tasks/useTaskHub';
import { useSession } from '../../lib/session';

const isKind = (v: string | null): v is TaskKind => KINDS.some(k => k.kind === v);

/** One place for homework, quizzes and tests: the list, the editor and homework review. */
export function TeacherAssignments() {
  const { user } = useSession();
  const portal = user?.role === 'TEACHER' ? '/teacher' : '/admin';
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const hub = useTaskHub(user?.role === 'TEACHER');
  const editTask = (id: string) => set({ edit: `homework:${id}`, new: '' });
  const homeworkActions = useAssignmentActions(hub.refetch, editTask);
  const assessmentActions = useAssessmentActions(hub.refetch);
  const filters: Filters = { kind: params.get('kind') ?? '', status: params.get('status') ?? '', q: params.get('q') ?? '', scope: params.get('scope') ?? '' };
  const creating = params.get('new'), editing = params.get('edit'), reviewing = params.get('task');

  function set(patch: Record<string, string>, replace = false) {
    setParams(p => { const next = new URLSearchParams(p); for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); } return next; }, { replace });
  }
  const closeEditor = () => set({ new: '', edit: '' });
  const open = (item: TaskItem) => item.source === 'homework' ? set({ task: item.id }) : set({ edit: `assessment:${item.id}` });

  if (isKind(creating) || editing) {
    const [source, id] = (editing ?? '').split(':');
    const target = editing ? { kind: (source === 'homework' ? 'HOMEWORK' : hub.items.find(i => i.id === id)?.kind ?? 'TEST') as TaskKind, id } : { kind: creating as TaskKind };
    if (editing && source !== 'homework' && hub.loading) return <LoadingBlock label="Opening…" />;
    return <TaskStudio key={editing ?? creating} target={target} classes={hub.classOptions} levels={hub.levelOptions}
      scope={{ classGroupId: hub.classOptions.find(c => c.id === filters.scope)?.id, levelId: hub.levelOptions.find(l => l.id === filters.scope)?.id }}
      onClose={closeEditor} onSaved={saved => { hub.refetch(); set(saved.kind === 'HOMEWORK' ? { new: '', edit: '', task: saved.id } : { new: '', edit: '' }); }} />;
  }
  if (reviewing) return <AssignmentReview key={reviewing} id={reviewing} onClose={() => { set({ task: '' }); hub.refetch(); }} onEdit={h => set({ task: '', edit: `homework:${h.id}` })} />;
  if (hub.loading) return <LoadingBlock label="Loading assignments…" />;
  if (hub.error && !hub.items.length) return <ErrorBlock message={hub.error} onRetry={hub.refetch} />;

  const list = applyFilters(hub.items, filters);
  const message = homeworkActions.error || assessmentActions.error;
  const notice = homeworkActions.notice || assessmentActions.notice;
  return (
    <div className="space-y-5">
      <TaskHubHeader items={hub.items} onCreate={kind => set({ new: kind })} onFilter={status => set({ status }, true)} />
      {message ? <p role="alert" className="alert alert-error alert-soft text-sm">{message}</p> : null}
      {notice ? <p role="status" className="alert alert-success alert-soft text-sm">{notice}</p> : null}
      <TaskFilters items={hub.items} value={filters} onChange={(key, value) => set({ [key]: value }, true)} fetching={hub.fetching} onRefresh={hub.refetch} />
      <section className="card border border-base-300 bg-base-100">
        {list.length ? <ul className="divide-y divide-base-300">{list.map(item => (
          <TaskRow key={item.key} item={item} onOpen={open} homeworkActions={homeworkActions} assessmentActions={assessmentActions}
            onEdit={i => set({ edit: `${i.source}:${i.id}` })} onResults={() => navigate(`${portal}/grading`)} />
        ))}</ul> : (
          <div className="p-10 text-center">
            <h2 className="font-semibold">{hub.items.length ? 'Nothing matches these filters' : 'Create your first assignment'}</h2>
            <p className="mt-2 text-sm text-muted">{hub.items.length ? 'Try another filter or clear your search.' : 'Start with homework for a class, or a quiz or test for a level.'}</p>
            {hub.items.length ? <button type="button" className="btn btn-sm mt-4 rounded-full" onClick={() => setParams({})}>Clear filters</button> : null}
          </div>
        )}
      </section>
    </div>
  );
}
