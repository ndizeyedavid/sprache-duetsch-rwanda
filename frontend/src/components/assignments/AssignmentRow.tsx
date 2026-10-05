import { FiArrowUpRight, FiClock, FiFileText, FiHeadphones, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { FeedItem } from './assignment-feed';
import { dateLabel, statusLabels, statusTone } from './homework/format';
export function AssignmentRow({ item }: { item: FeedItem }) {
  const late = item.dueAt && new Date(item.dueAt) < new Date() && !['GRADED', 'SUBMITTED'].includes(item.status);
  const status = late && item.status !== 'RETURNED' ? 'OVERDUE' : item.status;
  const Icon = item.status === 'GRADED' ? FiCheckCircle : item.kind === 'Homework' ? FiFileText : FiHeadphones;
  return <Link to={`/assignments/${item.id}`} className="group flex flex-wrap items-center gap-4 border-b border-base-300/60 p-4 transition hover:bg-base-200/45 last:border-0 sm:p-5">
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.isHomework ? 'bg-success text-success-content' : 'bg-secondary text-secondary-content'}`}><Icon size={20} /></span>
    <div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-wider text-base-content/50">{item.course} · {item.kind}</p><h3 className="mt-1 text-sm font-semibold group-hover:text-primary sm:text-base">{item.title}</h3><p className="mt-1 truncate text-xs text-base-content/55">{item.context}</p></div>
    <span className={`badge badge-soft badge-sm ${statusTone[status] ?? 'badge-ghost'}`}>{statusLabels[status] ?? status}</span>
    <div className="ml-[60px] flex w-full items-center gap-4 text-xs text-base-content/60 sm:ml-0 sm:w-auto sm:min-w-32 sm:flex-col sm:items-end sm:gap-1"><span className={late ? 'text-error' : ''}>{dateLabel(item.dueAt)}</span><span>{item.score !== null ? `${item.score}/${item.points} pts` : `${item.points} pts`}{item.minutes ? ` · ${item.minutes} min` : ''}</span></div>
    <FiArrowUpRight aria-hidden className="hidden text-base-content/40 sm:block" />
    {item.status === 'DRAFT' ? <span className="sr-only"><FiClock />Continue your saved draft</span> : null}
  </Link>;
}
