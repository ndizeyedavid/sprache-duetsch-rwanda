import { FiArchive,FiCopy,FiDownload,FiEdit2,FiEye,FiEyeOff,FiFileText,FiList,FiTrash2 } from 'react-icons/fi';
import { RowMenu } from '../../ui/RowMenu';
import { dateLabel,responseLabels } from '../homework/format';
import type { Homework } from '../homework/types';
import type { useAssignmentActions } from './useAssignmentActions';

type Props = { assignment: Homework; onOpen: (id: string) => void; onEdit: (id: string) => void; actions: ReturnType<typeof useAssignmentActions> };
export function StaffAssignmentRow({ assignment: a, onOpen, onEdit, actions }: Props) {
  const count = a.summary;
  const scheduled = a.status === 'PUBLISHED' && !!a.releaseAt && new Date(a.releaseAt) > new Date();
  const overdue = a.status === 'PUBLISHED' && !!a.dueAt && new Date(a.dueAt) < new Date() && !!count?.missing;
  const questionCount = a.questions?.length ?? 0;
  const Icon = questionCount ? FiList : FiFileText;
  const busy = actions.busyId === a.id;
  return <article className="relative flex flex-wrap items-center gap-4 border-b border-base-300/60 p-4 sm:p-5 last:border-0">
    <span className="grid size-11 shrink-0 place-items-center rounded-box bg-primary/10 text-primary"><Icon aria-hidden size={20} /></span>
    <button type="button" onClick={() => onOpen(a.id)} className="min-w-0 flex-1 text-left"><span className="block text-[11px] text-base-content/55">{a.classGroup.level.code} · {a.classGroup.name}</span><h2 className="mt-1 break-words text-sm font-semibold hover:text-primary">{a.title}</h2><span className="mt-1 block text-xs text-base-content/55">{questionCount ? `${questionCount} questions · Untimed` : responseLabels[a.responseType]} · {a.maxPoints} pts · Due {dateLabel(a.dueAt)}</span></button>
    <div className="flex items-center gap-2"><span className={`badge badge-soft badge-sm ${a.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>{scheduled ? 'Scheduled' : a.status === 'PUBLISHED' ? 'Published' : a.status === 'DRAFT' ? 'Draft' : 'Archived'}</span>{busy ? <span aria-label="Saving assignment" className="loading loading-spinner loading-xs" /> : null}<RowMenu label={`Actions for ${a.title}`} items={[
      { label: 'Edit assignment', icon: FiEdit2, onClick: () => onEdit(a.id), disabled: busy },
      { label: a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish', icon: a.status === 'PUBLISHED' ? FiEyeOff : FiEye, onClick: () => void actions.run(a, a.status === 'PUBLISHED' ? 'draft' : 'publish'), disabled: busy },
      { label: 'Duplicate as draft', icon: FiCopy, onClick: () => void actions.run(a, 'duplicate'), disabled: busy },
      { label: 'Download results', icon: FiDownload, onClick: () => void actions.run(a, 'export'), disabled: busy },
      ...(a.status !== 'ARCHIVED' ? [{ label: 'Archive', icon: FiArchive, onClick: () => void actions.run(a, 'archive'), disabled: busy }] : []),
      ...(a.status === 'DRAFT' && !a.submissions?.some(s => s.revision > 0) ? [{ label: 'Delete draft', icon: FiTrash2, onClick: () => void actions.run(a, 'delete'), disabled: busy, tone: 'danger' as const }] : []),
    ]} /></div>
    {count ? <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:pl-15"><span className="inline-flex items-center gap-2 text-base-content/60"><progress className="progress progress-success h-1.5 w-20" value={count.received} max={count.assigned || 1} aria-label={`Submissions for ${a.title}`} />{count.received}/{count.assigned} submitted</span><span className="text-base-content/60">{count.graded} graded{count.averageScore !== null ? ` · Avg ${count.averageScore.toFixed(1)}/${a.maxPoints}` : ''}</span>{count.returned ? <span className="text-warning">{count.returned} revisions requested</span> : null}{overdue ? <span className="text-error">{count.missing} missing · Past due</span> : null}{count.toReview ? <button className="btn btn-sm btn-soft btn-primary ml-auto rounded-full" onClick={() => onOpen(a.id)}>Review {count.toReview} {count.toReview === 1 ? 'response' : 'responses'}</button> : null}</div> : null}
  </article>;
}
