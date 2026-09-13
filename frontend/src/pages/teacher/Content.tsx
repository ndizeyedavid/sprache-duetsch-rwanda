import { useMemo } from 'react';
import { CurriculumManager } from '../../components/curriculum/CurriculumManager';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { listClasses, listLevels } from '../../lib/services';

/**
 * Teachers author content only for the levels they teach. The allowed levels are
 * derived from their own class groups; the API enforces the same rule.
 */
export function TeacherContent() {
  const classes = useApi('teacher-classes', listClasses);
  const levels = useApi('levels-catalog', listLevels);

  const allowedLevelIds = useMemo(
    () => new Set((classes.data ?? []).map((group) => group.levelId)),
    [classes.data],
  );
  const allowedLevels = useMemo(
    () => (levels.data ?? []).filter((level) => allowedLevelIds.has(level.id)),
    [levels.data, allowedLevelIds],
  );

  if (classes.loading || levels.loading) return <LoadingBlock label="Loading your curriculum…" />;
  if (classes.error || levels.error) {
    return (
      <ErrorBlock
        message={classes.error ?? levels.error ?? 'Could not load your curriculum.'}
        onRetry={() => {
          classes.refetch();
          levels.refetch();
        }}
      />
    );
  }

  if (allowedLevels.length === 0) {
    return (
      <EmptyBlock
        title="No levels to author yet"
        hint="You can add lessons once an academic admin assigns you to a class group."
      />
    );
  }

  return <CurriculumManager levels={allowedLevels} canCreateLevel={false} />;
}
