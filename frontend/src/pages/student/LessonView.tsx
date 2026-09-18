import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { completeLesson, getMyCourses, getStudentLesson, humanize } from '../../lib/services';
import { LessonDetail } from '../../components/student/LessonDetail';

export function StudentLesson() {
  const { slug = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const courses = useApi('my-courses', getMyCourses);
  const lesson = useApi(`lesson-${lessonId}`, () => getStudentLesson(lessonId), Boolean(lessonId));

  const [actionError, setActionError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  useEffect(() => {
    setLocalCompleted(false);
    setActionError(null);
  }, [lessonId]);

  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);

  const ordered = useMemo(() => {
    if (!course) return [];
    return course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((m) => m.lessons.slice().sort((a, b) => a.order - b.order).map((l) => ({ ...l, moduleTitle: m.title })));
  }, [course]);

  const index = ordered.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const currentMeta = ordered.find((l) => l.id === lessonId) ?? null;

  const isSwitching = lesson.fetching && !!lesson.data && lesson.data.id !== lessonId;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId]);

  async function handleComplete() {
    if (!lessonId) return;
    setActionError(null); setCompleting(true);
    try {
      await completeLesson(lessonId);
      setLocalCompleted(true);
      courses.refetch();
    } catch (err) { setActionError(apiErrorMessage(err, 'Could not save progress.')); } finally { setCompleting(false); }
  }

  if (courses.loading) return <LoadingBlock label="Loading course…" />;
  if (courses.error || !course) return <ErrorBlock message={courses.error ?? 'Course not found.'} onRetry={courses.refetch} />;
  if (lesson.loading) return <LoadingBlock label="Loading lesson…" />;
  if (lesson.error || !lesson.data) {
    const msg = lesson.error ?? 'Could not load lesson.';
    const isLocked = msg.toLowerCase().includes('prerequisite');
    return (
      <div className="space-y-4">
        <Link to={`/courses/${slug}/learn`} className="inline-flex items-center gap-1 text-xs hover:underline"><FiArrowLeft aria-hidden />Back to {course.level.code}</Link>
        <Panel>
          <EmptyBlock title={isLocked ? 'Lesson locked' : 'Lesson unavailable'} hint={msg} />
          <div className="mt-4 flex gap-2">
            <Link to={`/courses/${slug}/learn`} className="btn btn-sm rounded-full border-0 bg-brand text-white">Back to modules</Link>
            {prev ? <Link to={`/courses/${slug}/learn/${prev.id}`} className="btn btn-sm rounded-full border-line bg-base-100">Previous</Link> : null}
            {next ? <Link to={`/courses/${slug}/learn/${next.id}`} className="btn btn-sm rounded-full border-0 bg-brand text-white">Next</Link> : null}
          </div>
        </Panel>
      </div>
    );
  }

  const rawDetail = lesson.data;
  const detail = localCompleted ? { ...rawDetail, progressStatus: 'COMPLETED' } : rawDetail;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link to="/courses" className="hover:underline">My courses</Link>
        <span className="text-muted">/</span>
        <Link to={`/courses/${slug}/learn`} className="hover:underline">{course.level.code}</Link>
        <span className="text-muted">/</span>
        <span className="truncate font-medium text-ink">{currentMeta?.moduleTitle ?? rawDetail.module.title}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link to={`/courses/${slug}/learn`} className="btn btn-xs gap-1 rounded-full border-line bg-base-100"><FiArrowLeft aria-hidden />Modules</Link>
        <span className="flex items-center gap-1">
          <button type="button" disabled={!prev || isSwitching} onClick={() => prev && navigate(`/courses/${slug}/learn/${prev.id}`)} className="btn btn-sm btn-circle border-line bg-base-100 disabled:opacity-40" aria-label="Previous lesson"><FiChevronLeft aria-hidden /></button>
          <span className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex">
            {isSwitching ? <span className="loading loading-spinner loading-xs text-brand" aria-hidden /> : null}
            {index + 1} / {ordered.length}
          </span>
          <span className="text-xs text-muted sm:hidden">
            {isSwitching ? <span className="loading loading-spinner loading-xs text-brand mr-1" aria-hidden /> : null}
            {index + 1}/{ordered.length}
          </span>
          <button type="button" disabled={!next || isSwitching} onClick={() => next && navigate(`/courses/${slug}/learn/${next.id}`)} className="btn btn-sm btn-circle border-line bg-base-100 disabled:opacity-40" aria-label="Next lesson"><FiChevronRight aria-hidden /></button>
        </span>
      </div>

      {currentMeta ? (
        <p className="text-xs text-muted">{currentMeta.moduleTitle} · Lesson {index + 1} of {ordered.length} · {humanize(rawDetail.contentType)}{rawDetail.estimatedMinutes ? ` · ${rawDetail.estimatedMinutes} min` : ''}</p>
      ) : null}

      <Panel className="relative overflow-hidden">
        {isSwitching ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-base-100/70 pt-12 backdrop-blur-[1px]" aria-live="polite" aria-busy="true">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-base-100 px-4 py-2 text-xs font-medium shadow">
              <span className="loading loading-spinner loading-xs text-brand" aria-hidden /> Loading lesson…
            </span>
          </div>
        ) : null}
        <div className={`transition duration-200 ${isSwitching ? 'opacity-50' : 'opacity-100'}`} aria-busy={isSwitching}>
          <LessonDetail detail={detail as never} slug={slug} completing={completing} actionError={actionError} onComplete={handleComplete} />
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
          {prev ? <Link to={`/courses/${slug}/learn/${prev.id}`} aria-disabled={isSwitching} className={`btn btn-sm gap-1 rounded-full border-line bg-base-100 ${isSwitching ? 'pointer-events-none opacity-50' : ''}`}><FiChevronLeft aria-hidden />Previous — {prev.title}</Link> : <span />}
          {next ? <Link to={`/courses/${slug}/learn/${next.id}`} aria-disabled={isSwitching} className={`btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 ${isSwitching ? 'pointer-events-none opacity-60' : ''}`}>Next — {next.title}<FiChevronRight aria-hidden /></Link> : <Link to={`/courses/${slug}/learn`} className={`btn btn-sm rounded-full border-0 bg-brand text-white ${isSwitching ? 'pointer-events-none opacity-60' : ''}`}>Back to course</Link>}
        </div>
      </Panel>
    </div>
  );
}
