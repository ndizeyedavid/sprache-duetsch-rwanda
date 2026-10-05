import { TeacherCourseWorkspace } from '../../components/curriculum/TeacherCourseWorkspace';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { listMyTeachingLevels } from '../../lib/teaching';

/**
 * Teachers author content only for the levels they teach. The allowed levels are
 * approved by academic staff; the API enforces the same rule.
 */
export function TeacherContent() {
 
 const levels = useApi('my-teaching-levels', listMyTeachingLevels);

 const allowedLevels = levels.data ?? [];
 if (levels.loading) return <LoadingBlock label="Loading your curriculum…" />;
 if (levels.error) {
 return (
 <ErrorBlock
 message={levels.error ?? 'Could not load your curriculum.'}
 onRetry={() => {
 
 levels.refetch();
 }}
 />
 );
 }

 if (allowedLevels.length === 0) {
 return (
 <EmptyBlock
 title="No levels to author yet"
 hint="You can add lessons once an academic admin approves your teaching levels."
 />
 );
 }

 return <TeacherCourseWorkspace levels={allowedLevels} />;
}
