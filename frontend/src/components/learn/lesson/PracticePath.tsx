import type { IconType } from 'react-icons';
import { FiArrowRight,FiBookOpen,FiCheck,FiEdit3,FiHeadphones,FiLayers,FiMic,FiRepeat,FiType } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { LessonActivity } from '../../../lib/services';
import { isSessionConfig } from '../types';

const SESSION_ICONS: Record<string, IconType> = { words: FiType, grammar: FiLayers, listen: FiHeadphones, read: FiBookOpen, translate: FiRepeat };

function status(activity: LessonActivity): { label: string; done: boolean } {
  const sub = activity.mySubmission;
  if (!sub) return { label: activity.type === 'PRACTICE' ? 'Start' : 'Not handed in', done: false };
  if (activity.type === 'PRACTICE') return { label: `Done · ${Math.round(Number(sub.score ?? 1) * 100)}% first try`, done: true };
  return { label: sub.status === 'GRADED' ? 'Checked by your teacher' : 'Sent to your teacher', done: true };
}

/** The lesson's practice: Duolingo-style sessions first, then writing and speaking for the teacher. */
export function PracticePath({ activities, base }: { activities: LessonActivity[]; base: string }) {
  const sessions = activities.filter((a) => a.type === 'PRACTICE').sort((a, b) => a.order - b.order);
  const tasks = activities.filter((a) => a.type === 'WRITING' || a.type === 'SPEAKING').sort((a, b) => a.order - b.order);
  const next = sessions.find((a) => !a.mySubmission)?.id;
  const card = (activity: LessonActivity, Icon: IconType, subtitle: string) => {
    const state = status(activity);
    const highlight = activity.id === next;
    return <li key={activity.id}>
      <Link to={`${base}/activity/${activity.id}`} className={`flex items-center gap-3 rounded-box border p-3 transition-colors hover:border-primary ${highlight ? 'border-primary bg-brand-tint' : 'border-line bg-base-100'}`}>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg ${state.done ? 'bg-ok-soft text-ok' : highlight ? 'bg-primary text-primary-content' : 'bg-base-200 text-ink'}`}>
          {state.done ? <FiCheck aria-hidden /> : <Icon aria-hidden />}
        </span>
        <span className="min-w-0 grow">
          <span className="block font-semibold leading-tight" lang="de">{activity.title}</span>
          <span className="block text-xs text-muted">{subtitle}</span>
        </span>
        <span className={`shrink-0 text-xs font-semibold ${state.done ? 'text-ok' : 'text-primary'}`}>{highlight ? 'Next' : state.label}</span>
        <FiArrowRight aria-hidden className="shrink-0 text-muted" />
      </Link>
    </li>;
  };
  if (!sessions.length && !tasks.length) return null;
  return <section id="lesson-practice" className="card scroll-mt-24 border border-base-300 bg-base-100 p-4 xl:p-5" aria-label="Practice">
    <h2 className="text-lg font-bold">Üben · Practise</h2>
    <p className="text-xs text-muted">Short sessions, one question at a time. Finish them all to complete the lesson.</p>
    <ol className="mt-3 grid gap-2 md:grid-cols-2">
      {sessions.map((activity) => {
        const config = isSessionConfig(activity.config) ? activity.config : null;
        return card(activity, SESSION_ICONS[config?.session ?? ''] ?? FiLayers, `${config?.titleEn ?? 'Practice'} · ${config?.items.length ?? 0} questions${activity.mySubmission ? ` · ${status(activity).label}` : ''}`);
      })}
    </ol>
    {tasks.length ? <>
      <h3 className="mt-5 text-sm font-bold">For your teacher</h3>
      <ol className="mt-2 grid gap-2 md:grid-cols-2">
        {tasks.map((activity) => card(activity, activity.type === 'SPEAKING' ? FiMic : FiEdit3, `${activity.type === 'SPEAKING' ? 'Record yourself' : 'Write a short text'} · ${status(activity).label}`))}
      </ol>
    </> : null}
  </section>;
}
