import { CurriculumManager } from '../../components/curriculum/CurriculumManager';
import { ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { listLevels } from '../../lib/services';

export function AdminCourses() {
  const levels = useApi('admin-levels', listLevels);

  if (levels.loading) return <LoadingBlock label="Loading curriculum…" />;
  if (levels.error || !levels.data) {
    return <ErrorBlock message={levels.error ?? 'Could not load levels.'} onRetry={levels.refetch} />;
  }

  return <CurriculumManager levels={levels.data} canCreateLevel onLevelsChanged={levels.refetch} />;
}
