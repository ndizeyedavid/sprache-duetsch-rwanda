import { useState } from 'react';
import type { AnalyticsFilterValue } from '../../components/analytics/AnalyticsFilters';
import { AnalyticsFilters } from '../../components/analytics/AnalyticsFilters';
import { AtRiskPanel } from '../../components/analytics/AtRiskPanel';
import { RISK_FILTERS,riskFromLabel } from '../../components/analytics/constants';
import { GradingBacklogPanel } from '../../components/analytics/GradingBacklogPanel';
import { RetentionPanel } from '../../components/analytics/RetentionPanel';
import { useAtRisk } from '../../components/analytics/useAtRisk';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

/** Academic analytics: who needs support, how intakes retain, and where grading is stuck. */
export function AdminReports() {
  const [filter, setFilter] = useState<AnalyticsFilterValue>({ levelId: '', intakeId: '' });
  const [riskLabel, setRiskLabel] = useState<string>('All');
  const levelId = filter.levelId || undefined, intakeId = filter.intakeId || undefined;
  const risk = useAtRisk({ levelId, intakeId, riskLevel: riskFromLabel(riskLabel) }, 15);
  return (
    <div className="journey-enter space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Reports</h1>
          <p className="text-xs text-muted">Academic follow-up across classes, intakes and teachers.</p>
        </div>
        <AnalyticsFilters value={filter} onChange={setFilter} />
      </div>
      <AtRiskPanel
        risk={risk}
        linkFor={row => `/admin/students/${row.student.id}`}
        toolbar={<SegmentedControl ariaLabel="Risk level" options={[...RISK_FILTERS]} value={riskLabel} onChange={setRiskLabel} />}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="min-w-0"><RetentionPanel levelId={levelId} intakeId={intakeId} /></div>
        <div className="min-w-0"><GradingBacklogPanel /></div>
      </div>
    </div>
  );
}
