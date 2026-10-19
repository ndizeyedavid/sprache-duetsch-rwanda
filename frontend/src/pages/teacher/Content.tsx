import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { CourseStudioHero } from '../../components/curriculum/CourseStudioHero';
import { TeacherCourseWorkspace } from '../../components/curriculum/TeacherCourseWorkspace';
import { useApi } from '../../hooks/useApi';
import { listMyTeachingLevels } from '../../lib/teaching';

/**
 * Teachers author content only for the levels they teach. The allowed levels are
 * approved by academic staff; the API enforces the same rule.
 */
export function TeacherContent() {
  const levels = useApi('my-teaching-levels', listMyTeachingLevels);
  const allowedLevels = levels.data ?? [];
  if (levels.loading) return <div className="space-y-6"><CourseStudioHero /><LoadingBlock label="Loading your curriculum…" /></div>;
  if (levels.error) return <div className="space-y-6"><CourseStudioHero /><ErrorBlock message={levels.error} onRetry={levels.refetch} /></div>;
  if (allowedLevels.length === 0) {
    return (
      <div className="space-y-6">
        <CourseStudioHero />
        <EmptyBlock title="No levels to author yet" hint="You can add lessons once an academic admin approves your teaching levels." />
      </div>
    );
  }
  return <TeacherCourseWorkspace levels={allowedLevels} />;
}
