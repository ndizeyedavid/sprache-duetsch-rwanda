import { FiArrowRight,FiCheckCircle,FiClock,FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyAssessment } from '../../lib/services';
import { TYPE_LABEL } from './constants';
import { pct } from './utils';

type Props = { assessment: MyAssessment; whatIfOn: boolean; projected?: number; onProjection: (value: number | null) => void };
export function GradeResultCard({ assessment: a, whatIfOn, projected, onProjection }: Props) {
  const score = whatIfOn ? projected ?? a.bestScore : a.bestScore;
  const percentage = pct(score, a.maxScore);
  const graded = a.bestScore !== null;
  const started = a.latestStatus === 'IN_PROGRESS';
  const submitted = a.attemptCount > 0 && !started && !graded;
  const passed = graded && a.passMark !== null ? (pct(a.bestScore, a.maxScore) ?? 0) >= a.passMark : null;
  const label = graded ? passed === true ? 'Passed' : passed === false ? 'Needs practice' : 'Graded' : started ? 'In progress' : submitted ? 'Awaiting grading' : 'Not started';
  const Icon = graded ? FiCheckCircle : submitted ? FiClock : FiEdit3;
  return <article className="card border border-base-300 bg-base-100 p-5">
    <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-base-200"><Icon aria-hidden className="text-lg" /></span><span className={`badge border-0 text-[10px] ${passed === true ? 'badge-success' : passed === false ? 'badge-warning' : 'badge-neutral'}`}>{label}</span></div>
    <p className="mt-4 text-[10px] text-muted">{a.level?.code} · {TYPE_LABEL[a.type] ?? a.type}</p><h3 className="mt-1 text-sm font-semibold">{a.title}</h3>
    <div className="mt-4 flex items-end justify-between gap-3"><p className="text-3xl font-semibold tracking-tight">{percentage === null ? '—' : `${percentage}%`}</p><p className="text-[10px] text-muted">{score === null ? 'No score yet' : `${score}/${a.maxScore} points`}</p></div>
    <progress className="progress mt-3 h-1.5 w-full text-primary" value={percentage ?? 0} max={100} aria-label={`${a.title} score`} />
    <p className="mt-3 text-xs leading-5 text-muted">{passed === false ? 'Review your work and practise before your next attempt.' : submitted ? 'Your work is submitted. Your score will appear after grading.' : graded ? 'Review your result and keep building your skills.' : started ? 'Return to your assignment to continue.' : 'Complete this assignment to see your result.'}</p>
    {whatIfOn ? <label className="mt-3 flex items-center justify-between gap-2 text-xs">Projected points<input aria-label={`Projected points for ${a.title}`} type="number" min={0} max={a.maxScore} value={projected ?? a.bestScore ?? ''} onChange={e => onProjection(e.target.value === '' ? null : Math.min(a.maxScore, Math.max(0, Number(e.target.value))))} className="input input-sm w-20" /></label> : null}
    <Link to={`/assignments/ASM-${a.id}`} className="btn btn-sm mt-4 justify-between rounded-full">{graded ? 'Review result' : submitted ? 'View submission' : started ? 'Continue assignment' : 'Start assignment'}<FiArrowRight aria-hidden /></Link>
  </article>;
}
