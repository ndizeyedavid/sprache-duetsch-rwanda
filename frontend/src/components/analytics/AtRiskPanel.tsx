import type { ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { AtRiskRow } from '../../lib/analytics-api';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Pagination } from '../ui/Pagination';
import { Panel,SectionHeader } from '../ui/Panel';
import { AtRiskTable } from './AtRiskTable';
import type { AtRiskState } from './useAtRisk';

type Props = {
  risk: AtRiskState;
  linkFor: (row: AtRiskRow) => string | null;
  title?: string;
  action?: { label: string; to: string };
  /** Filters rendered above the table (selects, risk level switch). */
  toolbar?: ReactNode;
  compact?: boolean;
  paginate?: boolean;
};

export function AtRiskPanel({ risk, linkFor, title = 'At-risk students', action, toolbar, compact = false, paginate = true }: Props) {
  const { state, page, setPage } = risk;
  const result = state.data;
  return (
    <Panel>
      <SectionHeader title={title} action={action} className="mb-2" />
      {result ? (
        <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <FiAlertTriangle aria-hidden className="text-warning" />
          <span><strong className="text-base-content">{result.summary.students}</strong> students need follow-up</span>
          <span className="badge badge-error badge-soft badge-sm">{result.summary.high} high</span>
          <span className="badge badge-warning badge-soft badge-sm">{result.summary.medium} medium</span>
        </p>
      ) : null}
      {toolbar ? <div className="mb-3">{toolbar}</div> : null}
      {state.loading ? (
        <LoadingBlock label="Finding students who need support…" />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={state.refetch} />
      ) : !result?.data.length ? (
        <EmptyBlock title="No one is at risk right now" hint="Attendance, scores, homework and activity all look on track for this selection." />
      ) : (
        <div className={state.fetching ? 'opacity-60 transition-opacity' : ''}>
          <AtRiskTable rows={result.data} linkFor={linkFor} compact={compact} />
          {paginate && result.meta.totalPages > 1 ? (
            <Pagination
              page={page}
              pages={result.meta.totalPages}
              total={result.meta.total}
              from={(page - 1) * result.meta.pageSize + 1}
              to={Math.min(page * result.meta.pageSize, result.meta.total)}
              onChange={setPage}
            />
          ) : null}
        </div>
      )}
    </Panel>
  );
}
