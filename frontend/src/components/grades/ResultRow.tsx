import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiCheck, FiClock, FiFileText, FiMessageSquare } from 'react-icons/fi';
import type { GradeEntry } from './result-model';
import { resultLabels } from './result-model';
export function ResultRow({ entry: e }: { entry: GradeEntry }) {
  const percentage = e.score !== null && e.max > 0 ? Math.round(e.score / e.max * 100) : null;
  const Icon = e.state === 'returned' ? FiMessageSquare : e.state === 'waiting' ? FiClock : e.state === 'ready' ? FiCheck : FiFileText;
  const tone = e.state === 'returned' ? 'bg-warning text-warning-content' : e.state === 'ready' ? 'bg-success text-success-content' : e.state === 'waiting' ? 'bg-info text-info-content' : 'bg-base-200 text-base-content';
  const action = e.state === 'ready' ? 'Review result' : e.state === 'returned' ? 'Read feedback' : e.state === 'waiting' ? 'View submission' : e.state === 'started' ? 'Continue task' : 'Start task';
  return <article className="grid gap-4 border-b border-base-300/70 p-5 last:border-0 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-6">
    <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon aria-hidden size={19} /></span>
    <div className="min-w-0"><p className="text-xs text-base-content/55">{e.course} <span aria-hidden> / </span> {e.kind}</p><h3 className="mt-1 text-sm font-semibold sm:text-base">{e.title}</h3><div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 ${tone}`}>{resultLabels[e.state]}</span>{e.date ? <span className="text-base-content/55">Submitted {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span> : null}</div>{e.feedback ? <div className="mt-3 rounded-xl bg-base-200 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/55">Teacher feedback</p><p className="mt-1 line-clamp-2 text-xs leading-5">{e.feedback}</p></div> : e.state === 'waiting' ? <p className="mt-3 text-xs text-base-content/55">Your work is received. Your result will appear after review.</p> : null}</div>
    <div className="flex items-center justify-between gap-4 sm:min-w-36 sm:flex-col sm:items-end"><div className="sm:text-right"><p className="text-2xl font-semibold">{percentage === null ? '—' : `${percentage}%`}</p><p className="mt-1 text-xs text-base-content/55">{e.score === null ? 'No grade yet' : `${e.score} / ${e.max} points`}</p>{percentage !== null && e.passMark !== null ? <p className="mt-1 text-xs">{percentage >= e.passMark ? 'Pass mark met' : `Pass mark: ${e.passMark}%`}</p> : null}</div><Link to={e.href} className="btn btn-sm btn-ghost gap-2">{action}<FiArrowUpRight aria-hidden /></Link></div>
  </article>;
}
