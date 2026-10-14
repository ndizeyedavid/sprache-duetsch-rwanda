import { FiClock,FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getGradingBacklog } from '../../lib/analytics-api';
import { formatHours } from './format';

/** The signed-in teacher's own grading queue (the API returns only their row). */
export function TeacherBacklogStrip() {
  const backlog = useApi('my-grading-backlog', () => getGradingBacklog());
  const row = backlog.data?.[0];
  if (!row) return null;
  const items = [
    { label: 'Homework', value: row.homework },
    { label: 'Quizzes & tests', value: row.attempts },
    { label: 'Activities', value: row.activities },
  ];
  return (
    <section className="card learning-panel rounded-box p-4" aria-label="Your grading queue">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold"><FiInbox aria-hidden className="text-brand" />{row.total} to grade</span>
        {items.map(item => <span key={item.label} className="text-xs text-muted">{item.label}: <strong className="text-base-content">{item.value}</strong></span>)}
        <span className="inline-flex items-center gap-1 text-xs text-muted"><FiClock aria-hidden />Oldest {row.total ? formatHours(row.oldestWaitingHours) : '—'} · median turnaround {formatHours(row.medianTurnaroundHours)}</span>
        {row.total ? <Link to="/teacher/grading" className="btn btn-primary btn-xs ml-auto rounded-full">Open grading</Link> : null}
      </div>
    </section>
  );
}
