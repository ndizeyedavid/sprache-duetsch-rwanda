import type { ReactNode } from 'react';
import { CoursePaymentLock } from '../../components/student/CoursePaymentLock';
import { useEffect,useMemo,useState } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { CourseMapHero } from '../../components/student/CourseMapHero';
import { HorizontalCourseView } from '../../components/student/HorizontalCourseView';
import { StudentCourseModules } from '../../components/student/StudentCourseModules';
import { useApi } from '../../hooks/useApi';
import { getMyCourses } from '../../lib/services';

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

  const shell = (state: ReactNode) => <div className="space-y-4"><CourseMapHero slug={slug} />{state}</div>;
  if (courses.loading) return shell(<LoadingBlock label="Loading course…" />);
  if (courses.error || !courses.data) return shell(<ErrorBlock message={courses.error ?? 'Could not load course.'} onRetry={courses.refetch} />);
  if (!course) return shell(<EmptyBlock title="Not enrolled in this level" hint="Ask an admin to enrol you — only enrolled courses appear." />);

  if (course?.paymentRequired) return <CoursePaymentLock title={course.level.title} />;

  return (
    <div className="space-y-4">
      <CourseMapHero slug={slug} course={course} layout={layout} onLayout={setLayout} />

      {layout === 'horizontal' ? (
        <HorizontalCourseView course={course} slug={slug.toLowerCase()} onProgress={courses.refetch} />
      ) : (
        <StudentCourseModules course={course} slug={slug.toLowerCase()} layout={layout} />
      )}
    </div>
  );
}
