import { FiAward,FiCheckCircle,FiClock,FiMessageSquare } from 'react-icons/fi';
import type { GradeEntry } from './result-model';
export function ResultsOverview({ entries }: { entries: GradeEntry[] }) {
  const graded = entries.filter(e => e.score !== null && e.max > 0);
  const average = graded.length ? Math.round(graded.reduce((sum,e) => sum + e.score! / e.max, 0) / graded.length * 100) : null;
  const stats = [
    { label: 'Average result', value: average === null ? '—' : `${average}%`, hint: 'Each graded task counts equally', Icon: FiAward, tone: 'bg-neutral text-neutral-content' },
    { label: 'Results ready', value: entries.filter(e => e.state === 'ready').length, hint: 'Open a task to review your work', Icon: FiCheckCircle, tone: 'bg-success text-success-content' },
    { label: 'Awaiting review', value: entries.filter(e => e.state === 'waiting').length, hint: 'Submitted to your teacher', Icon: FiClock, tone: 'bg-info text-info-content' },
    { label: 'Needs your attention', value: entries.filter(e => e.state === 'returned').length, hint: 'Read feedback and revise your work', Icon: FiMessageSquare, tone: 'bg-warning text-warning-content' },
  ];
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(s => <div key={s.label} className="card border border-base-300 bg-base-100 p-4 sm:p-5"><span className={`mb-4 grid size-9 place-items-center rounded-xl ${s.tone}`}><s.Icon aria-hidden size={18} /></span><p className="text-xs text-base-content/65">{s.label}</p><p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p><p className="mt-2 text-xs leading-5 text-base-content/55">{s.hint}</p></div>)}</div>;
}
