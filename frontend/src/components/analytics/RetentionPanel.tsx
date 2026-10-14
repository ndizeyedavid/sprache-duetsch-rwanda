import { useApi } from '../../hooks/useApi';
import { getRetention } from '../../lib/analytics-api';
import { COLORS } from '../../lib/theme';
import { GroupedBar } from '../charts/GroupedBar';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel,SectionHeader } from '../ui/Panel';
import { DropoutList } from './DropoutList';
import { formatPercent } from './format';
import { RetentionTable } from './RetentionTable';

const SERIES = [
  { key: 'active', label: 'Active', color: COLORS.navy },
  { key: 'completed', label: 'Completed', color: COLORS.brand },
  { key: 'deferred', label: 'Deferred', color: COLORS.sun },
  { key: 'withdrawn', label: 'Withdrawn', color: COLORS.muted },
];

/** Retention by intake (and level) with the recent dropout list. Academic + super admins only. */
export function RetentionPanel({ levelId, intakeId }: { levelId?: string; intakeId?: string }) {
  const report = useApi(`retention-${levelId ?? ''}-${intakeId ?? ''}`, () => getRetention({ levelId, intakeId }));
  const data = report.data;
  return (
    <Panel>
      <SectionHeader title="Retention by intake" className="mb-2" />
      {report.loading ? <LoadingBlock label="Loading retention…" /> : report.error ? <ErrorBlock message={report.error} onRetry={report.refetch} /> : !data?.intakes.length ? (
        <EmptyBlock title="No enrolments yet" hint="Retention appears once students are enrolled in an intake." />
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-muted">
            <strong className="text-base-content">{formatPercent(data.totals.retentionRate)}</strong> retained ·{' '}
            <strong className="text-base-content">{formatPercent(data.totals.completionRate)}</strong> completed across {data.totals.enrolled} enrolments.
            Retention counts every enrolment that has not withdrawn.
          </p>
          <GroupedBar
            data={data.intakes.map(row => ({ intake: row.intake.code, active: row.active, completed: row.completed, deferred: row.deferred, withdrawn: row.withdrawn }))}
            xKey="intake"
            series={SERIES}
            stacked
            showLegend
            barSize={32}
            height={240}
          />
          <RetentionTable intakes={data.intakes} />
          <div>
            <h3 className="mb-2 text-sm font-semibold">Recent withdrawals · last {data.recentDays} days</h3>
            <DropoutList rows={data.dropouts} days={data.recentDays} />
          </div>
        </div>
      )}
    </Panel>
  );
}
