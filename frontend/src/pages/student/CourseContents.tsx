import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
  completeLesson,
  getMyCourses,
  getStudentLesson,
  humanize,
} from '../../lib/services';

export function CourseContents() {
  const { slug = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const course = useMemo(
    () =>
      courses.data?.find((item) => item.level.code.toLowerCase() === slug.toLowerCase()) ?? null,
    [courses.data, slug],
  );

  const lessonDetail = useApi(
    `lesson-${selectedLessonId ?? 'none'}`,
    () => getStudentLesson(selectedLessonId ?? ''),
    selectedLessonId !== null,
  );

  async function handleComplete() {
    if (!selectedLessonId) return;
    setActionError(null);
    setCompleting(true);
    try {
      await completeLesson(selectedLessonId);
      lessonDetail.refetch();
      courses.refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not save your progress.'));
    } finally {
      setCompleting(false);
    }
  }

  if (courses.loading) return <LoadingBlock label="Loading course content…" />;
  if (courses.error || !courses.data) {
    return <ErrorBlock message={courses.error ?? 'Could not load course content.'} onRetry={courses.refetch} />;
  }
  if (!course) {
    return <EmptyBlock title="Not enrolled in this level" hint="Ask an academic admin to enrol you first." />;
  }

  const detail = selectedLessonId ? lessonDetail.data : null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          {course.level.code} · {course.level.title}
        </p>
        <div className="mt-3">
          <ProgressBar value={course.stats.completionPercentage} tone="brand" />
        </div>
        <p className="mt-2 text-xs text-muted">
          {course.stats.completedLessons}/{course.stats.totalLessons} lessons complete
        </p>

        <h2 className="mt-5 text-sm font-semibold">Lessons</h2>
        {course.modules.length === 0 ? (
          <p className="mt-2 text-xs text-muted">Lessons for this level are not published yet.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {course.modules.map((module) => (
              <div key={module.id}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {module.title}
                </p>
                {module.lessons.length === 0 ? (
                  <p className="mt-1 text-[11px] text-muted">No lessons published yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-field px-3 py-2 text-left text-xs transition-colors ${
                            selectedLessonId === lesson.id
                              ? 'bg-brand-tint font-semibold text-ink'
                              : 'bg-base-200 text-muted hover:bg-brand-tint hover:text-ink'
                          }`}
                        >
                          <span className="truncate">{lesson.title}</span>
                          <StatusBadge
                            status={
                              lesson.progressStatus === 'COMPLETED'
                                ? 'Completed'
                                : humanize(lesson.progressStatus)
                            }
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="lg:col-span-2">
        {!selectedLessonId ? (
          <EmptyBlock title="Select a lesson" hint="Choose a lesson on the left to read notes, watch videos or listen to audio." />
        ) : lessonDetail.loading ? (
          <LoadingBlock label="Loading lesson…" />
        ) : lessonDetail.error || !lessonDetail.data ? (
          <ErrorBlock message={lessonDetail.error ?? 'Could not load this lesson.'} onRetry={lessonDetail.refetch} />
        ) : (
          <article>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Lesson</p>
            <h1 className="mt-1 text-xl font-semibold">{detail?.title}</h1>
            {detail?.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{detail.description}</p>
            ) : null}

            {detail?.videoUrl ? (
              <video key={detail.videoUrl} controls preload="metadata" className="mt-4 w-full rounded-box bg-night">
                <source src={detail.videoUrl} />
              </video>
            ) : null}
            {detail?.audioUrl ? (
              <audio key={detail.audioUrl} controls preload="metadata" className="mt-4 w-full">
                <source src={detail.audioUrl} />
              </audio>
            ) : null}
            {detail?.body ? (
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{detail.body}</div>
            ) : null}

            {detail && detail.materials.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold">Materials</h2>
                <ul className="mt-2 space-y-2">
                  {detail.materials.map((material) => (
                    <li
                      key={material.id}
                      className="flex items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2 text-xs"
                    >
                      <span className="truncate font-medium">{material.title}</span>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 font-semibold text-brand hover:underline"
                      >
                        {humanize(material.type)} · Open
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {detail && detail.activities.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold">Activities ({detail.activities.length})</h2>
                <ul className="mt-2 space-y-2">
                  {detail.activities.map((activity) => (
                    <li key={activity.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                      <p className="font-medium">{activity.title}</p>
                      {activity.instructions ? (
                        <p className="mt-1 text-muted">{activity.instructions}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {actionError ? (
              <p role="alert" className="mt-4 text-xs font-medium text-error">
                {actionError}
              </p>
            ) : null}
            <button
              type="button"
              disabled={completing || detail?.progressStatus === 'COMPLETED'}
              onClick={handleComplete}
              className="btn mt-6 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {completing ? <span className="loading loading-spinner loading-sm" /> : null}
              {detail?.progressStatus === 'COMPLETED' ? 'Completed' : 'Mark as complete'}
            </button>
          </article>
        )}
      </Panel>
    </div>
  );
}
