import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getMyCourses } from '../../lib/services';
import { StudentCourseModules } from '../../components/student/StudentCourseModules';
import { HorizontalCourseView } from '../../components/student/HorizontalCourseView';

const LAYOUT_KEY = 'sparch.course.layout';

export function CourseContents() {
  const { slug = '' } = useParams();
  const courses = useApi('my-courses', getMyCourses);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>(() => {
    try {
      const v = localStorage.getItem(LAYOUT_KEY) as 'vertical' | 'horizontal' | null;
      return v === 'horizontal' ? 'horizontal' : 'vertical';
    } catch {
      return 'vertical';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch {
      // ignore quota
    }
  }, [layout]);
  // keep in sync if changed in another tab / LessonView
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LAYOUT_KEY && (e.newValue === 'vertical' || e.newValue === 'horizontal')) setLayout(e.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const course = useMemo(() => courses.data?.find((c) => c.level.code.toLowerCase() === slug.toLowerCase()) ?? null, [courses.data, slug]);

  if (courses.loading) return <LoadingBlock label="Loading course…" />;
  if (courses.error || !courses.data) return <ErrorBlock message={courses.error ?? 'Could not load course.'} onRetry={courses.refetch} />;
  if (!course) return <EmptyBlock title="Not enrolled in this level" hint="Ask an admin to enrol you — only enrolled courses appear." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <Link to="/courses" className="inline-flex items-center gap-1 hover:underline"><FiArrowLeft aria-hidden />My courses</Link>
          <span className="text-muted">/</span>
          <Link to={`/courses/${course.level.code.toLowerCase()}`} className="font-semibold text-ink hover:underline">{course.level.code}</Link>
          <span className="text-muted">/</span>
          <span className="font-medium text-brand">Modules</span>
        </span>
        <span className="flex items-center gap-1 rounded-full border border-line bg-base-100 p-1">
          <button type="button" onClick={() => setLayout('vertical')} className={`btn btn-xs gap-1 rounded-full ${layout === 'vertical' ? 'border-0 bg-brand text-white' : 'btn-ghost'}`} aria-pressed={layout === 'vertical'}><FiList aria-hidden />Vertical</button>
          <button type="button" onClick={() => setLayout('horizontal')} className={`btn btn-xs gap-1 rounded-full ${layout === 'horizontal' ? 'border-0 bg-brand text-white' : 'btn-ghost'}`} aria-pressed={layout === 'horizontal'}><FiGrid aria-hidden />Horizontal</button>
        </span>
      </div>

      {layout === 'horizontal' ? (
        <HorizontalCourseView course={course} slug={slug.toLowerCase()} onProgress={courses.refetch} />
      ) : (
        <StudentCourseModules course={course} slug={slug.toLowerCase()} layout={layout} />
      )}
    </div>
  );
}
