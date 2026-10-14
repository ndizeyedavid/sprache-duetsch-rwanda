import { useCallback,useMemo,useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link,useParams } from 'react-router-dom';
import { ActivityIntro } from '../../components/activity-player/ActivityIntro';
import { ActivityPlayer } from '../../components/activity-player/ActivityPlayer';
import { ActivityReviewPanel } from '../../components/activity-player/ActivityReviewPanel';
import { isAntiCheatExempt,isCompletionType,isResponseReady,lockedResponse,submitLabel } from '../../components/activity-player/response-utils';
import type { ActivityConfig } from '../../components/activity-player/types';
import type { SubmissionView } from '../../components/activity-player/useActivityAttempt';
import { useActivityAttempt } from '../../components/activity-player/useActivityAttempt';
import { AntiCheatGuard } from '../../components/assignments/AntiCheatGuard';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { ActivityNavigation } from '../../components/student/practice/ActivityNavigation';
import { ActivityOutcome } from '../../components/student/practice/ActivityOutcome';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getMyCourses,getStudentLesson,reportActivityViolation } from '../../lib/services';

export function StudentActivity() {
  const { slug = '', lessonId = '', activityId = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const lessonApi = useApi(`lesson-${lessonId}`, () => getStudentLesson(lessonId), Boolean(lessonId));
  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);
  const ordered = useMemo(() => course ? course.modules.slice().sort((a, b) => a.order - b.order).flatMap((m) => m.lessons.slice().sort((a, b) => a.order - b.order)) : [], [course]);
  const lessonIndex = ordered.findIndex((l) => l.id === lessonId);
  const nextLesson = lessonIndex >= 0 && lessonIndex < ordered.length - 1 ? ordered[lessonIndex + 1] : null;
  const activity = lessonApi.data?.activities.find((x) => x.id === activityId) ?? null;
  const config = (activity?.config && typeof activity.config === 'object' ? activity.config : {}) as ActivityConfig;
  const type = activity?.type ?? '';
  const refetchLesson = lessonApi.refetch;
  const attempt = useActivityAttempt(activityId, type, (activity?.mySubmission ?? null) as SubmissionView | null, useCallback(() => refetchLesson(), [refetchLesson]));
  const [cheatLocked, setCheatLocked] = useState(false);

  if (courses.loading || lessonApi.loading) return <LoadingBlock label="Loading activity…" />;
  if (courses.error || !course) return <ErrorBlock message={courses.error ?? 'Course not found.'} onRetry={courses.refetch} />;
  if (lessonApi.error || !lessonApi.data) return <ErrorBlock message={lessonApi.error ?? 'Lesson not found.'} onRetry={lessonApi.refetch} />;
  if (!activity) return (
    <div className="space-y-4">
      <Link to={`/courses/${slug}/learn/${lessonId}`} className="inline-flex items-center gap-1 text-xs hover:underline"><FiArrowLeft aria-hidden />Back to lesson</Link>
      <Panel><EmptyBlock title="Activity not found" hint="This activity may have been removed." /></Panel>
    </div>
  );

  const guarded = !isAntiCheatExempt(type, config);
  const ready = isResponseReady(type, config, attempt.value);
  const result = attempt.result;
  const cheatKey = `cheat:ACT:${activityId}`;
  const onLock = () => {
    setCheatLocked(true);
    void attempt.submit(lockedResponse(attempt.value)).then((ok) => { if (ok) localStorage.removeItem(cheatKey); });
  };

  return (
    <div className="space-y-4">
      <ActivityNavigation slug={slug} lessonId={lessonId} code={course.level.code} title={activity.title} type={type} />
      <ActivityIntro title={activity.title} type={type} instructions={activity.instructions} guarded={guarded} />
      <Panel>
        <AntiCheatGuard enabled={guarded && attempt.editing && !cheatLocked} persistKey={cheatKey}
          onViolation={(violation) => void reportActivityViolation(activityId, violation).catch(() => {})} onLock={onLock}>
          {attempt.editing || !result ? (
            <form className={`space-y-4 p-1 ${cheatLocked ? 'pointer-events-none opacity-40' : ''}`} onSubmit={(event) => { event.preventDefault(); if (ready) void attempt.submit(attempt.value); }}>
              <ActivityPlayer activityId={activityId} type={type} config={config} value={attempt.value} onChange={attempt.setValue} disabled={attempt.submitting || cheatLocked} />
              {cheatLocked ? <p role="alert" className="rounded-box bg-error px-3 py-2 text-xs font-bold text-white">Locked — 3 violations. Flagged for review.</p> : null}
              {attempt.error ? <p role="alert" className="rounded-box bg-error px-3 py-2 text-xs font-medium text-error-content">{attempt.error}</p> : null}
              <button type="submit" disabled={attempt.submitting || cheatLocked || !ready} className="btn rounded-full border-0 bg-brand px-6 text-white hover:bg-brand hover:text-primary-content disabled:opacity-50">
                {attempt.submitting ? <span className="loading loading-spinner loading-xs" /> : null}{submitLabel(type, config)}
              </button>
            </form>
          ) : (
            <ActivityOutcome isCorrect={result.isCorrect} status={result.status} attemptNumber={result.attemptNumber} score={result.score !== null ? Number(result.score) : null}
              feedback={result.feedback} completion={isCompletionType(type)} slug={slug} lessonId={lessonId} nextLesson={nextLesson} handleRedo={attempt.redo}>
              <ActivityReviewPanel type={type} config={config} response={result.response} review={result.review} />
            </ActivityOutcome>
          )}
        </AntiCheatGuard>
      </Panel>
    </div>
  );
}
