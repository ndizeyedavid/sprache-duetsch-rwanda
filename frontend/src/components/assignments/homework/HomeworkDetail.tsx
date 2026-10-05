import { useApi } from '../../../hooks/useApi';
import { getHomework } from '../../../lib/homework';
import { LoadingBlock, ErrorBlock } from '../../common/PageState';
import { HomeworkWorkspace } from './HomeworkWorkspace';
export function HomeworkDetail({ id }: { id: string }) {
  const detail = useApi(`homework-${id}`, () => getHomework(id));
  if (detail.loading || detail.stale) return <LoadingBlock label="Opening your workspace…" />;
  if (detail.error || !detail.data) return <ErrorBlock message={detail.error ?? 'Assignment unavailable.'} onRetry={detail.refetch} />;
  return <HomeworkWorkspace key={`${id}-${detail.data.submission?.status ?? 'new'}-${detail.data.submission?.revision ?? 0}`} data={detail.data} refetch={detail.refetch} />;
}
