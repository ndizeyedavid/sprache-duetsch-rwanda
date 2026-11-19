import { FiArrowRight,FiCheckCircle,FiClock,FiRefreshCw,FiTarget } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { PracticeProgress } from '../../../lib/services';
import type { SessionItem } from '../types';

type Props = {
  score: number;
  seconds: number;
  mistakes: SessionItem[];
  saving: boolean;
  error: string | null;
  lessonCompleted: boolean;
  xp?: number;
  progress?: PracticeProgress;
  lessonHref: string;
  nextHref: string | null;
  onRetrySave: () => void;
  onRestart: () => void;
};

const answerOf = (item: SessionItem) => item.kind === 'match' ? item.pairs.map((pair) => pair.join(' = ')).join(' · ')
  : item.kind === 'truefalse' ? `${item.statement} → ${item.answer ? 'richtig' : 'falsch'}`
    : item.kind === 'fill' ? item.text.replace('___', item.answer)
      : item.kind === 'listen' || item.kind === 'speak' ? item.text
        : item.kind === 'choose' ? (item.prompt?.includes('___') ? item.prompt.replace('___', item.answer) : item.answer) : item.answer;

/** End of a session: accuracy, time, what to review, and where to go next. */
export function SessionSummary({ score, seconds, mistakes, saving, error, lessonCompleted, xp, progress, lessonHref, nextHref, onRetrySave, onRestart }: Props) {
  const percent = Math.round(score * 100);
  return <div className="space-y-5 text-center">
    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-ok-soft text-3xl text-ok"><FiCheckCircle aria-hidden /></div>
    <div>
      <h2 className="text-2xl font-bold">{percent >= 90 ? 'Ausgezeichnet!' : percent >= 70 ? 'Gut gemacht!' : 'Geschafft!'}</h2>
      <p className="text-sm text-muted">{percent >= 90 ? 'Excellent work!' : percent >= 70 ? 'Well done!' : 'Session complete. Practise again to get more right first time.'}</p>
    </div>
    <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
      <div className="rounded-box border border-line p-3"><FiTarget aria-hidden className="mx-auto text-primary" /><p className="text-2xl font-bold tabular-nums">{percent}%</p><p className="text-xs text-muted">right first time</p></div>
      <div className="rounded-box border border-line p-3"><FiClock aria-hidden className="mx-auto text-primary" /><p className="text-2xl font-bold tabular-nums">{Math.max(1, Math.round(seconds / 60))} min</p><p className="text-xs text-muted">practice time</p></div>
    </div>
    {xp ? <p className="text-sm font-semibold"><span className="rounded-full bg-primary px-3 py-1 text-primary-content">+{xp} XP</span>
      {progress ? <span className="ml-2 text-muted">🔥 {progress.streak}-day streak · {Math.min(progress.xpToday, progress.dailyGoal)}/{progress.dailyGoal} XP today</span> : null}</p> : null}
    {lessonCompleted ? <p className="rounded-box bg-ok-soft px-3 py-2 text-sm font-semibold text-ok">Lesson complete: every practice session is done.</p> : null}
    {mistakes.length ? <div className="mx-auto max-w-lg text-left">
      <p className="text-sm font-bold">Review these</p>
      <ul className="mt-2 space-y-1.5">{mistakes.map((item) => <li key={item.id} lang="de" className="rounded-box bg-base-200 px-3 py-2 text-sm">{answerOf(item)}</li>)}</ul>
    </div> : null}
    {saving ? <p role="status" className="text-xs text-muted">Saving your progress…</p> : null}
    {error ? <p role="alert" className="text-xs font-semibold text-error">{error} <button type="button" className="link" onClick={onRetrySave}>Try again</button></p> : null}
    <div className="flex flex-wrap justify-center gap-2">
      <Link to={lessonHref} className="btn rounded-full border-line bg-base-100">Back to lesson</Link>
      <button type="button" onClick={onRestart} className="btn rounded-full border-line bg-base-100"><FiRefreshCw aria-hidden />Practise again</button>
      {nextHref ? <Link to={nextHref} className="btn rounded-full border-0 bg-primary text-primary-content">Next session<FiArrowRight aria-hidden /></Link> : null}
    </div>
  </div>;
}
