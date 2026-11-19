import { useEffect,useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../../../lib/api';
import type { PracticeProgress } from '../../../lib/services';
import { GlossaryContext } from '../translate/glossary-context';
import type { Glossary,LessonContent,SessionConfig } from '../types';
import { FeedbackBar } from './FeedbackBar';
import { isAnswered } from './grading';
import { ItemView } from './items/ItemView';
import { PassagePanel } from './PassagePanel';
import { SessionSummary } from './SessionSummary';
import { useSession } from './useSession';

/** What saving a finished session returns (lesson sessions and reviews). */
export type SessionSaved = { lessonCompleted?: boolean; xp?: number; progress?: PracticeProgress };
type Props = {
  title: string; config: SessionConfig; content: LessonContent | null; glossary?: Glossary;
  backHref: string; nextHref: string | null;
  save: (payload: { results: Record<string, boolean>; seconds: number }) => Promise<SessionSaved>;
  onSaved?: () => void;
};
type Save = { status: 'idle' | 'saving' | 'saved' | 'error'; error?: string; seconds: number } & SessionSaved;

/** One Duolingo-style practice session: a question per screen, instant feedback, then a summary. */
export function PracticeSession({ title, config, content, glossary, backHref, nextHref, save: saveResults, onSaved }: Props) {
  const session = useSession(config.items);
  const [save, setSave] = useState<Save>({ status: 'idle', seconds: 0 });
  async function persist(seconds: number) {
    setSave({ status: 'saving', seconds });
    try {
      const result = await saveResults({ results: session.results, seconds });
      setSave({ status: 'saved', seconds, lessonCompleted: result.lessonCompleted === true, xp: result.xp, progress: result.progress });
      onSaved?.();
    } catch (error) {
      setSave({ status: 'error', seconds, error: apiErrorMessage(error, 'Could not save your progress.') });
    }
  }
  function proceed() {
    if (session.isLast) void persist(session.seconds());
    session.next();
  }
  const item = session.item;
  const canCheck = isAnswered(session.answer);
  useEffect(() => {
    const enter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
      if (!session.verdict && canCheck) session.check();
    };
    window.addEventListener('keydown', enter);
    return () => window.removeEventListener('keydown', enter);
  }, [session, canCheck]);

  return <GlossaryContext.Provider value={content?.glossary ?? glossary ?? {}}>
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to={backHref} aria-label="Leave the session" className="btn btn-ghost btn-sm btn-circle"><FiX aria-hidden className="text-lg" /></Link>
        <progress className="progress progress-primary h-3 grow" value={session.progress * 100} max={100} aria-label="Session progress" />
        <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted">{session.done ? 'Done' : `${session.remaining} left`}</span>
      </div>
      <section className="card min-h-[24rem] border border-base-300 bg-base-100 p-4 sm:p-6">
        {session.done || !item
          ? <SessionSummary score={session.score} seconds={save.seconds} mistakes={session.mistakes} saving={save.status === 'saving'} error={save.status === 'error' ? save.error ?? null : null}
            lessonCompleted={save.lessonCompleted === true} xp={save.xp} progress={save.progress} lessonHref={backHref} nextHref={nextHref} onRetrySave={() => void persist(save.seconds)}
            onRestart={() => { setSave({ status: 'idle', seconds: 0 }); session.restart(); }} />
          : <div className="flex h-full flex-col gap-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary" lang="de">{title}</p>
              <p className="text-xs text-muted">{config.titleEn}</p>
            </div>
            {config.passage ? <PassagePanel passage={config.passage} content={content} /> : null}
            <div className="grow"><ItemView key={`${item.id}:${session.step}`} item={item} answer={session.answer} setAnswer={session.setAnswer} verdict={session.verdict} submit={session.check} /></div>
            <FeedbackBar verdict={session.verdict} canCheck={canCheck} selfChecking={item.kind === 'match'} speaking={item.kind === 'speak'}
              onCheck={() => session.check()} onContinue={proceed} onSkipSpeaking={session.skipSpeaking} />
          </div>}
      </section>
    </div>
  </GlossaryContext.Provider>;
}
