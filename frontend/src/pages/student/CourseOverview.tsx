import type { ReactNode } from 'react';
import { CoursePaymentLock } from '../../components/student/CoursePaymentLock';
import { FiCheck,FiChevronDown } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { CourseMap } from '../../components/student/course-map/CourseMap';
import { CourseOverviewHero,CourseOverviewHeroPlaceholder } from '../../components/student/CourseOverviewHero';
import { CoursebookResource } from '../../components/student/coursebook/CoursebookResource';
import { useApi } from '../../hooks/useApi';
import { getMyCourses,listLevels } from '../../lib/services';

export function CourseOverview() {
  const { slug = '' } = useParams();
  const levels = useApi('levels-catalog', listLevels);
  const mine = useApi('my-courses', getMyCourses);

  const placeholder = (state: ReactNode) => <div className="space-y-4"><CourseOverviewHeroPlaceholder code={slug} />{state}</div>;
  if (levels.loading || mine.loading) return placeholder(<LoadingBlock label="Loading course…" />);
  if (levels.error || !levels.data) return placeholder(<ErrorBlock message={levels.error ?? 'Could not load course.'} onRetry={levels.refetch} />);
  if (mine.error) return placeholder(<ErrorBlock message={mine.error} onRetry={mine.refetch} />);
  const level = levels.data.find((item) => item.code.toLowerCase() === slug.toLowerCase());
  if (!level) return placeholder(<EmptyBlock title="Course not found" hint="Choose a course from My courses." />);
  const course = mine.data?.find((item) => item.level.id === level.id) ?? null;

  if (course?.paymentRequired) return <CoursePaymentLock title={course.level.title} />;

  return (
    <div className="journey-enter space-y-4">
      <CourseOverviewHero level={level} course={course} />
      {course ? <CoursebookResource key={level.id} levelId={level.id} /> : null}
      {course ? <CourseMap course={course} /> : null}
      {level.objectives.length > 0 ? <details className="group rounded-box border border-base-300 bg-base-100 px-5 py-4 sm:px-7">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">What you’ll learn<FiChevronDown aria-hidden className="transition-transform group-open:rotate-180" /></summary>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {level.objectives.map((objective) => <li key={objective} className="flex items-start gap-2 text-xs leading-6 text-muted"><FiCheck aria-hidden className="mt-1.5 shrink-0 text-primary" />{objective}</li>)}
        </ul>
      </details> : null}
    </div>
  );
}
