import { FiArrowRight,FiAward,FiCalendar,FiClock,FiFileText,FiRepeat } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AssignmentRules } from './AssignmentRules';

type Props = { onStart: () => void; loading?: boolean; error?: string | null; exhausted?: boolean; questions?: number; duration?: number | null; attempts?: number; maxAttempts?: number | null; passMark?: unknown; due?: string | null; activity?: boolean; protectedMode?: boolean };

export function AssignmentReadyPanel({ onStart, loading, error, exhausted, questions, duration, attempts = 0, maxAttempts, passMark, due, activity, protectedMode }: Props) {
  const facts = activity ? [{ label: 'Response', value: '1 activity', icon: FiFileText }] : [
    { label: 'Questions', value: questions ?? '—', icon: FiFileText },
    { label: 'Duration', value: duration ? `${duration} min` : 'Untimed', icon: FiClock },
    { label: 'Attempts used', value: `${attempts} / ${maxAttempts ?? '—'}`, icon: FiRepeat },
    { label: 'Pass mark', value: passMark == null ? '—' : `${String(passMark)}%`, icon: FiAward },
  ];
  return (
    <aside className="card learning-panel gap-4 p-5 sm:p-6">
      <h3 className="text-sm font-semibold">{exhausted ? 'Attempts complete' : 'Ready to begin?'}</h3>
      <dl className={`grid gap-2 ${activity ? '' : 'grid-cols-2'}`}>{facts.map((fact) => <div key={fact.label} className="rounded-field bg-base-200/65 p-3"><dt className="flex items-center gap-1.5 text-[10px] text-base-content/60"><fact.icon aria-hidden />{fact.label}</dt><dd className="mt-2 text-sm font-semibold">{fact.value}</dd></div>)}</dl>
      {due ? <p className="flex items-center gap-2 text-[11px] text-base-content/65"><FiCalendar aria-hidden />Due {new Date(due).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p> : null}
      {protectedMode ? <AssignmentRules /> : <p className="rounded-field bg-success/5 p-3 text-xs leading-6 text-base-content/65">{activity ? "Prepare your response, then submit when ready." : "Answers save as you work. If timed, the timer continues when you leave or resume."}</p>}
      {error ? <p role="alert" className="rounded-field bg-error/10 p-3 text-xs text-error">{error}</p> : null}
      <button type="button" disabled={loading || exhausted} onClick={onStart} className="btn btn-primary w-full gap-2 rounded-full">{loading ? <span className="loading loading-spinner loading-xs" /> : null}{exhausted ? 'No attempts left' : activity ? 'Start assignment' : 'Start assessment'}<FiArrowRight aria-hidden /></button>
      {exhausted ? <Link to="/grades" className="btn btn-ghost btn-sm rounded-full">View grades</Link> : <p className="text-center text-[10px] text-base-content/55">{protectedMode ? 'Starting opens fullscreen.' : 'Read carefully. You can review answers before submitting.'}</p>}
    </aside>
  );
}
