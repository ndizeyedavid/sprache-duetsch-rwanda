import { FiArrowUpRight,FiAward,FiCalendar,FiCheck,FiEdit3,FiHeadphones,FiMic,FiType } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { AssignmentItem } from '../../lib/services';
import { STATUS_LABEL,STATUS_TONE } from './constants';
import { bucketOf,humanType } from './utils';

type Props = { item: AssignmentItem };

export function AssignmentCard({ item }: Props) {
  const bucket = bucketOf(item);
  const finished = bucket === 'Done';
  const urgent = bucket === 'Overdue' || bucket === 'Missing';
  const Icon = item.source === 'ASSESSMENT' ? FiAward : item.type.includes('LISTEN') ? FiHeadphones : item.type.includes('SPEAK') ? FiMic : item.type === 'FILL_BLANK' ? FiType : FiEdit3;
  const status = urgent ? bucket : STATUS_LABEL[item.status] ?? humanType(item.status);
  return (
    <Link to={`/assignments/${encodeURIComponent(item.id)}`} className="card learning-panel group h-full gap-4 p-5 transition-colors hover:border-primary hover:bg-base-100">
      <div className="flex items-center justify-between gap-3"><span className={`grid size-11 place-items-center rounded-2xl ${finished ? 'bg-success text-success-content' : item.source === 'ASSESSMENT' ? 'bg-primary text-primary-content' : 'bg-secondary text-secondary-content'}`}>{finished ? <FiCheck aria-hidden className="text-xl" /> : <Icon aria-hidden className="text-xl" />}</span><span className={`badge badge-soft badge-sm text-[10px] ${urgent ? 'badge-error' : STATUS_TONE[item.status] ?? 'badge-ghost'}`}>{status}</span></div>
      <div><p className="text-[10px] font-medium uppercase tracking-widest text-muted">{item.levelCode} · {humanType(item.type)}</p><h3 className="mt-2 text-base font-semibold leading-6">{item.title}</h3>{item.lessonTitle ? <p className="mt-1 line-clamp-1 text-[11px] text-muted">{item.lessonTitle}</p> : null}</div>
      <div className="mt-auto flex flex-wrap items-center gap-3 text-[11px] text-muted"><span className={`flex items-center gap-1.5 ${urgent ? 'text-error' : ''}`}><FiCalendar aria-hidden />{item.dueAt ? new Date(item.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No deadline'}</span><span className="ml-auto">{item.score !== null ? `${item.score}/${item.maxScore} pts` : `${item.points} pts`}</span></div>
      <div className="flex items-center justify-between border-t border-base-300 pt-3 text-xs font-semibold"><span>{item.status === 'GRADED' ? 'View feedback' : item.status === 'SUBMITTED' ? 'View submission' : item.status === 'IN_PROGRESS' ? 'Continue' : 'Open assignment'}</span><FiArrowUpRight aria-hidden className="text-base text-muted" /></div>
    </Link>
  );
}
