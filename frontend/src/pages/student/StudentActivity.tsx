import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { getMyCourses, getStudentLesson, reportActivityViolation, submitActivity } from '../../lib/services';
import { humanize } from '../../lib/services';
import { AntiCheatGuard } from '../../components/assignments/AntiCheatGuard';

type ActivityConfig = Record<string, unknown>;

function parseActivity(a: { title: string; type: string; instructions: string | null; config: unknown }) {
  const cfg = (a.config ?? {}) as ActivityConfig;
  return { ...a, cfg };
}

export function StudentActivity() {
  const { slug = '', lessonId = '', activityId = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const lessonApi = useApi(`lesson-${lessonId}`, () => getStudentLesson(lessonId), Boolean(lessonId));

  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);
  const ordered = useMemo(() => {
    if (!course) return [];
    return course.modules.slice().sort((a, b) => a.order - b.order).flatMap((m) => m.lessons.slice().sort((a, b) => a.order - b.order));
  }, [course]);
  const lessonIndex = ordered.findIndex((l) => l.id === lessonId);
  const nextLesson = lessonIndex >= 0 && lessonIndex < ordered.length - 1 ? ordered[lessonIndex + 1] : null;

  const lesson = lessonApi.data;
  const activityRaw = useMemo(() => lesson?.activities.find((x) => x.id === activityId) ?? null, [lesson, activityId]);
  const activity = activityRaw ? parseActivity(activityRaw as never) : null;

  const existingSubmission = (activityRaw as unknown as { mySubmission?: { id: string; status: string; isCorrect: boolean | null; score: string | number | null; maxScore: string | number; feedback: string | null; attemptNumber: number; response: unknown } | null })?.mySubmission ?? null;

  useEffect(() => {
    if (existingSubmission) {
      setSubmitted(true);
      setIsCorrect(existingSubmission.isCorrect);
      setScore(existingSubmission.score !== null ? Number(existingSubmission.score) : null);
      setFeedback(existingSubmission.feedback ?? null);
      setAttemptNumber(existingSubmission.attemptNumber);
      const resp = existingSubmission.response;
      if (activity?.type === 'MCQ' && typeof resp === 'number') setMcqChoice(resp);
      else if (activity?.type === 'TRUE_FALSE' && (resp === true || resp === false || resp === 'true' || resp === 'false')) setTfChoice(resp === true || resp === 'true');
      else if (typeof resp === 'string') setAnswer(resp);
      else if (Array.isArray(resp)) setAnswer(JSON.stringify(resp));
    } else {
      setSubmitted(false);
      setIsCorrect(null);
      setScore(null);
      setFeedback(null);
      setAttemptNumber(null);
    }
  }, [activityId, existingSubmission, activity?.type]);

  const [answer, setAnswer] = useState<string>('');
  const [mcqChoice, setMcqChoice] = useState<number | null>(null);
  const [tfChoice, setTfChoice] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [cheatLocked, setCheatLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number | null>(null);

  if (courses.loading || lessonApi.loading) return <LoadingBlock label="Loading activity…" />;
  if (courses.error || !course) return <ErrorBlock message={courses.error ?? 'Course not found.'} onRetry={courses.refetch} />;
  if (lessonApi.error || !lesson) return <ErrorBlock message={lessonApi.error ?? 'Lesson not found.'} onRetry={lessonApi.refetch} />;
  if (!activity) return (
    <div className="space-y-4">
      <Link to={`/courses/${slug}/learn/${lessonId}`} className="inline-flex items-center gap-1 text-xs hover:underline"><FiArrowLeft aria-hidden />Back to lesson</Link>
      <Panel><EmptyBlock title="Activity not found" hint="This activity may have been removed." /></Panel>
    </div>
  );

  const cfg = activity.cfg as Record<string, unknown>;
  const type = activity.type;

  async function handleSubmit() {
    let response: unknown = answer;
    if (type === 'MCQ') response = mcqChoice;
    else if (type === 'TRUE_FALSE') response = tfChoice;
    else if (type === 'ORDERING' && answer.trim().startsWith('[')) {
      try { response = JSON.parse(answer); } catch { response = answer; }
    }
    setSubmitting(true); setSubmitError(null);
    try {
      const sub = await submitActivity(activityId, response);
      setIsCorrect(sub.isCorrect);
      setScore(sub.score !== null && sub.score !== undefined ? Number(sub.score) : null);
      setFeedback(sub.feedback ?? null);
      setAttemptNumber(sub.attemptNumber);
      setSubmitted(true);
      lessonApi.refetch();
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not submit activity.'));
    } finally { setSubmitting(false); }
  }

  function handleRedo() {
    setSubmitted(false);
    setIsCorrect(null);
    setScore(null);
    setFeedback(null);
    setSubmitError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link to="/courses" className="hover:underline">My courses</Link><span className="text-muted">/</span>
        <Link to={`/courses/${slug}/learn`} className="hover:underline">{course.level.code}</Link><span className="text-muted">/</span>
        <Link to={`/courses/${slug}/learn/${lessonId}`} className="hover:underline">Lesson</Link><span className="text-muted">/</span>
        <span className="font-medium text-ink truncate">{activity.title}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/courses/${slug}/learn/${lessonId}`} className="btn btn-xs gap-1 rounded-full border-line bg-base-100"><FiArrowLeft aria-hidden />Back to lesson</Link>
        <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{humanize(type)}</span>
      </div>

      <Panel>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-box border border-warning/20 bg-warning/5 px-3 py-1.5 text-xs font-bold text-warning">Anti-cheat: fullscreen · no copy/paste · 3 strikes lock</span>
        </div>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-[#B30A00]"><FiClock aria-hidden />Practice activity</span>
        <h1 className="mt-2 text-xl font-bold leading-tight">{activity.title}</h1>
        {activity.instructions ? <p className="mt-1 text-sm leading-relaxed text-muted">{activity.instructions}</p> : null}
        {type === 'WRITING' && cfg.prompt ? <p className="mt-3 rounded-box border border-line bg-base-200/40 p-3 text-sm">{String(cfg.prompt)}</p> : null}
        {type === 'DOCUMENT' && cfg.prompt ? <p className="mt-3 rounded-box border border-line bg-base-200/40 p-3 text-sm">{String(cfg.prompt)}</p> : null}
      </Panel>

      <Panel>
        <AntiCheatGuard
          enabled={!submitted && !cheatLocked}
          persistKey={`cheat:ACT:${activityId}`}
          onViolation={(type) => void reportActivityViolation(activityId, type).catch(() => {})}
          onLock={() => {
            setCheatLocked(true);
            const v = answer.trim() || (typeof mcqChoice === "number" ? String(mcqChoice) : tfChoice !== null ? String(tfChoice) : "[No answer — violations]");
            void submitActivity(activityId, v)
              .then(() => {
                setSubmitted(true);
                localStorage.removeItem(`cheat:ACT:${activityId}`);
              })
              .catch(() => {});
          }}
        >
          {!submitted ? (
            <div className={`space-y-4 ${cheatLocked ? "pointer-events-none opacity-40" : ""}`}>
              {type === 'FILL_BLANK' ? (
                <div>
                  <p className="text-sm font-medium">Fill in the blank</p>
                  <p className="mt-1 rounded-box border border-line bg-base-100 p-3 text-sm">
                    {String(cfg.sentence ?? activity.instructions ?? cfg.prompt ?? 'Complete the sentence:')} 
                    <span className="mx-1 inline-flex items-center"><input value={answer} onChange={(e) => setAnswer(e.currentTarget.value)} placeholder="your answer" className="input input-sm w-32 rounded-full border-line bg-base-100 text-sm" /></span>
                  </p>
                  {cfg.sentence ? <p className="mt-2 text-xs text-muted">Type the missing word — spelling matters.</p> : null}
                </div>
              ) : null}

              {type === 'TRUE_FALSE' ? (
                <div>
                  <p className="text-sm font-medium">True or false?</p>
                  <p className="mt-2 rounded-box border border-line bg-base-100 p-4 text-sm font-medium">{String(cfg.statement ?? cfg.sentence ?? activity.title)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setTfChoice(true)} className={`rounded-box border p-4 text-sm font-semibold transition ${tfChoice === true ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-base-100 hover:border-brand/20'}`}>True</button>
                    <button type="button" onClick={() => setTfChoice(false)} className={`rounded-box border p-4 text-sm font-semibold transition ${tfChoice === false ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-base-100 hover:border-brand/20'}`}>False</button>
                  </div>
                </div>
              ) : null}

              {type === 'MCQ' ? (
                <div>
                  <p className="text-sm font-medium">{String(cfg.question ?? cfg.prompt ?? activity.title)}</p>
                  <div className="mt-3 space-y-2">
                    {(Array.isArray(cfg.options) ? cfg.options as string[] : []).map((opt: string, idx: number) => (
                      <button key={idx} type="button" onClick={() => setMcqChoice(idx)} className={`flex w-full items-center gap-3 rounded-box border px-4 py-3 text-left text-sm transition ${mcqChoice === idx ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20'}`}>
                        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${mcqChoice === idx ? 'border-brand bg-brand text-white' : 'border-line bg-base-200'}`}>{String.fromCharCode(65 + idx)}</span>
                        {opt}
                      </button>
                    ))}
                    {(!cfg.options || (cfg.options as unknown[]).length === 0) ? <p className="text-xs text-muted">No options configured — contact your teacher.</p> : null}
                  </div>
                </div>
              ) : null}

              {(type === 'WRITING' || type === 'DOCUMENT') ? (
                <div>
                  <p className="text-sm font-medium">Your answer</p>
                  <textarea value={answer} onChange={(e) => setAnswer(e.currentTarget.value)} placeholder={type === 'DOCUMENT' ? 'Describe your submission or paste a link…' : 'Write your answer here…'} rows={6} className="textarea mt-2 w-full rounded-box border-line bg-base-100 text-sm" />
                  <p className="mt-1 text-xs text-muted">{type === 'WRITING' && cfg.minWords ? `Minimum ${String(cfg.minWords)} words.` : 'Your teacher will review this.'}</p>
                  {type === 'DOCUMENT' && cfg.allowedTypes ? <p className="text-xs text-muted">Allowed: {String(cfg.allowedTypes)}</p> : null}
                </div>
              ) : null}

              {type !== 'FILL_BLANK' && type !== 'TRUE_FALSE' && type !== 'MCQ' && type !== 'WRITING' && type !== 'DOCUMENT' ? (
                <div>
                  <p className="text-sm text-muted">Complete this activity as instructed.</p>
                  <textarea value={answer} onChange={(e) => setAnswer(e.currentTarget.value)} placeholder="Your answer…" rows={4} className="textarea mt-2 w-full rounded-box border-line bg-base-100 text-sm" />
                </div>
              ) : null}

              {cheatLocked ? <p role="alert" className="rounded-box bg-error px-3 py-2 text-xs font-bold text-white">Locked — 3 violations. Flagged for review.</p> : null}
              {submitError ? <p role="alert" className="rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{submitError}</p> : null}
              <button type="button" onClick={() => void handleSubmit()} disabled={submitting || cheatLocked || (type === 'MCQ' ? mcqChoice === null : type === 'TRUE_FALSE' ? tfChoice === null : !answer.trim())} className="btn rounded-full border-0 bg-brand px-6 text-white hover:bg-brand/90 disabled:opacity-50">{submitting ? <span className="loading loading-spinner loading-xs" /> : null}Submit</button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${isCorrect ? 'bg-brand-soft text-brand' : isCorrect === false ? 'bg-coral-soft text-coral' : 'bg-sun-soft text-[#8A6800]'}`}>
                {isCorrect ? <FiCheck aria-hidden className="text-xl" /> : isCorrect === false ? <FiAlertCircle aria-hidden className="text-xl" /> : <FiClock aria-hidden className="text-xl" />}
              </div>
              <h2 className="text-lg font-bold">{isCorrect ? 'Well done!' : isCorrect === false ? 'Not quite' : existingSubmission?.status === 'SUBMITTED' ? 'Submitted — awaiting grading' : 'Submitted'}</h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                {isCorrect ? 'Your answer was correct.' : isCorrect === false ? 'Check the feedback and try again, or continue.' : existingSubmission?.status === 'SUBMITTED' ? 'Your facilitator will review and grade this soon.' : 'Your submission has been recorded.'}
              </p>
              <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
                <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium">Attempt #{attemptNumber ?? 1}</span>
                {score !== null ? <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrect ? 'bg-brand text-white' : isCorrect === false ? 'bg-coral text-white' : 'bg-base-200'}`}>Score: {score}/1</span> : null}
                {existingSubmission?.status ? <span className="rounded-full bg-base-200 px-3 py-1 text-xs">{existingSubmission.status}</span> : null}
              </div>
              {feedback ? <p className="mx-auto max-w-md rounded-box bg-base-200 px-3 py-2 text-xs">Feedback: <span className="font-medium">{feedback}</span></p> : null}
              {type === 'FILL_BLANK' && isCorrect === false && cfg.answer ? <p className="rounded-box bg-base-200 px-3 py-2 text-xs">Correct answer: <span className="font-semibold">{String(cfg.answer)}</span></p> : null}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Link to={`/courses/${slug}/learn/${lessonId}`} className="btn gap-1 rounded-full border-line bg-base-100"><FiArrowLeft aria-hidden />Back to lesson</Link>
                <button type="button" onClick={handleRedo} className="btn gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiRefreshCw aria-hidden />Redo</button>
                {nextLesson ? <Link to={`/courses/${slug}/learn/${nextLesson.id}`} className="btn gap-1 rounded-full border-line bg-base-100">Next lesson<FiArrowRight aria-hidden /></Link> : <Link to={`/courses/${slug}/learn`} className="btn gap-1 rounded-full border-line bg-base-100">Back to course<FiExternalLink aria-hidden /></Link>}
              </div>
              <p className="text-[11px] text-muted">Your progress is saved for your facilitator to review.</p>
            </div>
          )}
        </AntiCheatGuard>
      </Panel>
    </div>
  );
}
