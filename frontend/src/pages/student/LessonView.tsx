import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { completeLesson, getMyCourses, getStudentLesson } from '../../lib/services';
import { LessonDetail } from '../../components/student/LessonDetail';
import { CoursePlayerShell } from '../../components/student/CoursePlayerShell';
import { LessonOverview } from '../../components/student/LessonOverview';

export function StudentLesson() {
  const { slug = '', lessonId = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const lesson = useApi(`lesson-${lessonId}`, () => getStudentLesson(lessonId), Boolean(lessonId));
  const [actionError, setActionError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);
  const course = useMemo(() => courses.data?.find(c => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);
  const ordered = useMemo(() => course?.modules.slice().sort((a, b) => a.order - b.order).flatMap(m => m.lessons.slice().sort((a, b) => a.order - b.order)) ?? [], [course]);
  const index = ordered.findIndex(l => l.id === lessonId);
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 ? ordered[index + 1] : null;
  const switching = !!lesson.data && lesson.data.id !== lessonId;
  useEffect(() => { setActionError(null); window.scrollTo({ top: 0, behavior: 'instant' }); }, [lessonId]);

  async function handleComplete() {
    if (completing || switching) return;
    setActionError(null); setCompleting(true);
    try { await completeLesson(lessonId); setCompletedId(lessonId); courses.refetch(); }
    catch (err) { setActionError(apiErrorMessage(err, 'Could not save progress.')); }
    finally { setCompleting(false); }
  }

  if (courses.loading) return <LoadingBlock label="Loading course…" />;
  if (courses.error || !course) return <ErrorBlock message={courses.error ?? 'Course not found.'} onRetry={courses.refetch} />;
  const detail = lesson.data && !switching ? { ...lesson.data, progressStatus: completedId === lessonId ? 'COMPLETED' : lesson.data.progressStatus } : null;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to={`/courses/${slug}/learn`} className="inline-flex items-center gap-2 text-xs text-base-content/60 hover:text-primary"><FiArrowLeft aria-hidden />{course.level.code} course map</Link><span className="text-xs text-base-content/55">Lesson {index >= 0 ? index + 1 : '—'} of {ordered.length}</span></div>
    <CoursePlayerShell course={course} slug={slug} activeLessonId={lessonId}>
      {lesson.loading || switching ? <LoadingBlock label="Opening lesson…" /> : lesson.error || !detail ? <section className="card border border-base-300 bg-base-100 p-6"><h1 className="mb-3 text-xl font-semibold">{lesson.error?.toLowerCase().includes('prerequisite') ? 'Complete the previous lesson first' : 'Lesson unavailable'}</h1><ErrorBlock message={lesson.error ?? 'Could not load this lesson.'} onRetry={lesson.refetch} />{prev ? <Link to={`/courses/${slug}/learn/${prev.id}`} className="btn btn-sm mt-4 self-start rounded-full">Previous lesson</Link> : null}</section> : <div className="space-y-4">
        <LessonOverview detail={detail} />
        <section className="card overflow-hidden border border-base-300/70 bg-base-100 p-5 sm:p-7"><LessonDetail key={lessonId} detail={detail} slug={slug} completing={completing} actionError={actionError} onComplete={handleComplete} /></section>
        <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2">
          {prev ? <Link to={`/courses/${slug}/learn/${prev.id}`} className="card flex-row items-center gap-3 border border-base-300/70 bg-base-100 p-4 hover:border-primary/30"><FiChevronLeft aria-hidden className="shrink-0" /><div><p className="text-[10px] text-base-content/50">Previous lesson</p><p className="mt-1 text-xs font-semibold">{prev.title}</p></div></Link> : <span />}
          <Link to={next ? `/courses/${slug}/learn/${next.id}` : `/courses/${slug}/learn`} className="card flex-row items-center justify-between gap-3 border border-base-300/70 bg-base-100 p-4 hover:border-primary/30"><div><p className="text-[10px] text-base-content/50">{next ? 'Next lesson' : 'Course overview'}</p><p className="mt-1 text-xs font-semibold">{next?.title ?? 'Return to your learning path'}</p></div><FiChevronRight aria-hidden className="shrink-0" /></Link>
        </nav>
      </div>}
    </CoursePlayerShell>
  </div>;
}
