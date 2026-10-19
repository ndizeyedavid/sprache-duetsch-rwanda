import type { ReactNode } from 'react';
import { FiAlertCircle,FiArrowLeft,FiArrowRight,FiCheck,FiClock,FiExternalLink,FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type Props = { isCorrect: boolean | null; status?: string; attemptNumber: number | null; score: number | null;
  feedback: string | null; completion?: boolean; slug: string; lessonId: string;
  nextLesson: { id: string } | null; handleRedo: () => void; children?: ReactNode };

/** Result header after a submission; `score` is the 0–1 share of marks. */
export function ActivityOutcome({ isCorrect, status, attemptNumber, score, feedback, completion, slug, lessonId, nextLesson, handleRedo, children }: Props) {
  const partial = isCorrect === false && score !== null && score > 0;
  const title = completion ? 'Set completed' : isCorrect ? 'Well done!' : partial ? 'Partly right' : isCorrect === false ? 'Not quite' : status === 'SUBMITTED' ? 'Submitted — awaiting grading' : 'Graded';
  const message = completion ? 'Nice work. Come back any time to review these cards again.'
    : isCorrect ? 'Your answer was correct.' : isCorrect === false ? 'Check the review below, then try again or continue.'
    : status === 'SUBMITTED' ? 'Your facilitator will review and grade this soon.' : 'Your facilitator has reviewed your work.';
  return (
    <div className="space-y-4 text-center">
      <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${isCorrect || completion ? 'bg-brand text-primary-content' : isCorrect === false ? 'bg-coral text-error-content' : 'bg-sun text-warning-content'}`}>
        {isCorrect || completion ? <FiCheck aria-hidden className="text-xl" /> : isCorrect === false ? <FiAlertCircle aria-hidden className="text-xl" /> : <FiClock aria-hidden className="text-xl" />}
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">{message}</p>
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
        <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">Attempt #{attemptNumber ?? 1}</span>
        {score !== null && !completion ? <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrect ? 'bg-brand text-white' : isCorrect === false ? 'bg-coral text-white' : 'bg-base-200'}`}>Score: {Math.round(score * 100)}%</span> : null}
        {status ? <span className="rounded-full bg-base-200 px-3 py-1 text-xs">{status === 'GRADED' ? 'Graded' : 'Submitted'}</span> : null}
      </div>
      {feedback ? <p className="mx-auto max-w-md rounded-box bg-base-200 px-3 py-2 text-xs">Feedback: <span className="font-medium">{feedback}</span></p> : null}
      {children}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Link to={`/courses/${slug}/learn/${lessonId}`} className="btn gap-1 rounded-full border-line bg-base-100"><FiArrowLeft aria-hidden />Back to lesson</Link>
        <button type="button" onClick={handleRedo} className="btn gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content"><FiRefreshCw aria-hidden />{completion ? 'Review again' : 'Redo'}</button>
        {nextLesson ? <Link to={`/courses/${slug}/learn/${nextLesson.id}`} className="btn gap-1 rounded-full border-line bg-base-100">Next lesson<FiArrowRight aria-hidden /></Link> : <Link to={`/courses/${slug}/learn`} className="btn gap-1 rounded-full border-line bg-base-100">Back to course<FiExternalLink aria-hidden /></Link>}
      </div>
      <p className="text-[0.6875rem] text-muted">Your progress is saved for your facilitator to review.</p>
    </div>
  );
}
