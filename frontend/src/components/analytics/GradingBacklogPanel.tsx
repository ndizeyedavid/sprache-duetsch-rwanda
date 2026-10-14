import { useApi } from '../../hooks/useApi';
import { getGradingBacklog } from '../../lib/analytics-api';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel,SectionHeader } from '../ui/Panel';
import { GradingBacklogTable } from './GradingBacklogTable';

/** All teachers' grading queues (academic + super admins). */
export function GradingBacklogPanel() {
  const backlog = useApi('grading-backlog', () => getGradingBacklog());
  const rows = backlog.data ?? [];
  const waiting = rows.reduce((sum, row) => sum + row.total, 0);
  return (
    <Panel>
      <SectionHeader title="Grading backlog" className="mb-2" />
      <p className="mb-3 text-xs text-muted">
        <strong className="text-base-content">{waiting}</strong> submissions waiting for review. Turnaround is the median time from submission to grade over the last 30 days.
      </p>
      {backlog.loading ? <LoadingBlock label="Loading grading queues…" /> : backlog.error ? <ErrorBlock message={backlog.error} onRetry={backlog.refetch} /> : !rows.length ? (
        <EmptyBlock title="No teachers yet" hint="Assign teachers to classes to track grading." />
      ) : <GradingBacklogTable rows={rows} />}
    </Panel>
  );
}
