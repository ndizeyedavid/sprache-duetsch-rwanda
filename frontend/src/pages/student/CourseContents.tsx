import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getMyCourses } from '../../lib/services';
import { StudentCourseModules } from '../../components/student/StudentCourseModules';

export function CourseContents() {
  const { slug = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);

  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);

  if (courses.loading) return <LoadingBlock label="Loading course…" />;
  if (courses.error || !courses.data) return <ErrorBlock message={courses.error ?? 'Could not load course.'} onRetry={courses.refetch} />;
  if (!course) return <EmptyBlock title="Not enrolled in this level" hint="Ask an admin to enrol you — only enrolled courses appear." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link to="/courses" className="inline-flex items-center gap-1 hover:underline"><FiArrowLeft aria-hidden />My courses</Link>
        <span className="text-muted">/</span>
        <Link to={`/courses/${course.level.code.toLowerCase()}`} className="font-semibold text-ink hover:underline">{course.level.code}</Link>
        <span className="text-muted">/</span>
        <span className="font-medium text-brand">Modules</span>
      </div>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{course.level.code} · {course.level.levelLabel}</p>
            <h1 className="mt-1 text-xl font-bold leading-tight">{course.level.title}</h1>
            {course.level.summary ? <p className="mt-1 text-sm leading-relaxed text-muted">{course.level.summary}</p> : null}
          </div>
          <Link to={`/courses/${course.level.code.toLowerCase()}`} className="btn btn-xs shrink-0 rounded-full border-line bg-base-100">Overview</Link>
        </div>
        <div className="mt-4">
          <ProgressBar value={course.stats.completionPercentage} tone="brand" />
          <p className="mt-1.5 text-xs text-muted">{course.stats.completedLessons}/{course.stats.totalLessons} lessons · {course.stats.completionPercentage}% completed</p>
        </div>
      </Panel>

      <StudentCourseModules course={course} slug={slug.toLowerCase()} />
    </div>
  );
}
