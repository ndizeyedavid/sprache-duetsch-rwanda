import { FiArchive, FiBarChart2, FiCopy, FiDownload, FiEdit2, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import type { RowMenuItem } from '../ui/RowMenu';
import { RowMenu } from '../ui/RowMenu';
import type { useAssignmentActions } from '../assignments/teacher/useAssignmentActions';
import type { TaskItem } from './task-types';
import { kindMeta } from './task-types';
import type { useAssessmentActions } from './useAssessmentActions';

type Props = {
  item: TaskItem; onOpen: (item: TaskItem) => void; onEdit: (item: TaskItem) => void; onResults: () => void;
  homeworkActions: ReturnType<typeof useAssignmentActions>; assessmentActions: ReturnType<typeof useAssessmentActions>;
};

const tone = { HOMEWORK: 'bg-brand/10 text-brand', QUIZ: 'bg-secondary/20 text-secondary-content', TEST: 'bg-night/10 text-night' } as const;
const statusLabel = { DRAFT: ['Draft', 'badge-ghost'], PUBLISHED: ['Published', 'badge-success'], ARCHIVED: ['Archived', 'badge-ghost'] } as const;

export function TaskRow({ item, onOpen, onEdit, onResults, homeworkActions, assessmentActions }: Props) {
  const meta = kindMeta(item.kind); const Icon = meta.icon;
  const busy = homeworkActions.busyId === item.id || assessmentActions.busyId === item.id;
  const published = item.status === 'PUBLISHED';
  const h = item.homework;
  const menu: RowMenuItem[] = item.source === 'homework' && h ? [
    { label: 'Edit', icon: FiEdit2, onClick: () => onEdit(item), disabled: busy },
    { label: published ? 'Unpublish' : 'Publish', icon: published ? FiEyeOff : FiEye, onClick: () => void homeworkActions.run(h, published ? 'draft' : 'publish'), disabled: busy },
    { label: 'Duplicate as draft', icon: FiCopy, onClick: () => void homeworkActions.run(h, 'duplicate'), disabled: busy },
    { label: 'Download results', icon: FiDownload, onClick: () => void homeworkActions.run(h, 'export'), disabled: busy },
    ...(item.status !== 'ARCHIVED' ? [{ label: 'Archive', icon: FiArchive, onClick: () => void homeworkActions.run(h, 'archive'), disabled: busy }] : []),
    ...(item.status === 'DRAFT' ? [{ label: 'Delete draft', icon: FiTrash2, onClick: () => void homeworkActions.run(h, 'delete'), disabled: busy, tone: 'danger' as const }] : []),
  ] : [
    { label: 'Edit', icon: FiEdit2, onClick: () => onEdit(item), disabled: busy },
    { label: published ? 'Unpublish' : 'Publish', icon: published ? FiEyeOff : FiEye, onClick: () => void assessmentActions.run(item, published ? 'unpublish' : 'publish'), disabled: busy },
    { label: 'See results', icon: FiBarChart2, onClick: onResults },
    { label: 'Delete', icon: FiTrash2, onClick: () => void assessmentActions.run(item, 'delete'), disabled: busy, tone: 'danger' as const },
  ];
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-5">
      <span className={`grid size-10 shrink-0 place-items-center rounded-box ${tone[item.kind]}`} title={meta.label}><Icon aria-hidden /></span>
      <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold hover:text-brand">{item.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">{meta.label} · {item.scope} · {item.summary}</span>
      </button>
      <span className="hidden w-32 shrink-0 text-xs text-muted md:block">{item.whenLabel}</span>
      <span className={`badge badge-sm badge-soft shrink-0 ${statusLabel[item.status][1]}`}>{statusLabel[item.status][0]}</span>
      {item.toReview ? <button type="button" className="btn btn-xs shrink-0 rounded-full border-0 bg-brand text-white hover:bg-brand/90" onClick={() => onOpen(item)}>Review {item.toReview}</button> : null}
      {busy ? <span className="loading loading-spinner loading-xs" aria-label="Saving" /> : null}
      <RowMenu label={`Actions for ${item.title}`} items={menu} />
    </li>
  );
}
