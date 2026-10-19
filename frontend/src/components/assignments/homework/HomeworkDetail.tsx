import { useApi } from '../../../hooks/useApi';
import { getHomework } from '../../../lib/homework';
import { ErrorBlock,LoadingBlock } from '../../common/PageState';
import { AssignmentHeroPlaceholder } from '../AssignmentDetailHeader';
import { HomeworkWorkspace } from './HomeworkWorkspace';
export function HomeworkDetail({ id }: { id: string }) {
  const detail = useApi(`homework-${id}`, () => getHomework(id));
  if (detail.loading || detail.stale) return <div className="space-y-5"><AssignmentHeroPlaceholder /><LoadingBlock label="Opening your workspace…" /></div>;
  if (detail.error || !detail.data) return <div className="space-y-5"><AssignmentHeroPlaceholder /><ErrorBlock message={detail.error ?? 'Assignment unavailable.'} onRetry={detail.refetch} /></div>;
  return <HomeworkWorkspace key={`${id}-${detail.data.submission?.status ?? 'new'}-${detail.data.submission?.revision ?? 0}`} data={detail.data} refetch={detail.refetch} />;
}
