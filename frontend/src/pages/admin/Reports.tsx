import { useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { AnalyticsFilterValue } from '../../components/analytics/AnalyticsFilters';
import { AnalyticsFilters } from '../../components/analytics/AnalyticsFilters';
import { AtRiskPanel } from '../../components/analytics/AtRiskPanel';
import { RISK_FILTERS,riskFromLabel } from '../../components/analytics/constants';
import { GradingBacklogPanel } from '../../components/analytics/GradingBacklogPanel';
import { RetentionPanel } from '../../components/analytics/RetentionPanel';
import { useAtRisk } from '../../components/analytics/useAtRisk';
import { heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

/** Academic analytics: who needs support, how intakes retain, and where grading is stuck. */
export function AdminReports() {
  const [filter, setFilter] = useState<AnalyticsFilterValue>({ levelId: '', intakeId: '' });
  const [riskLabel, setRiskLabel] = useState<string>('All');
  const levelId = filter.levelId || undefined, intakeId = filter.intakeId || undefined;
  const risk = useAtRisk({ levelId, intakeId, riskLevel: riskFromLabel(riskLabel) }, 15);
  return (
    <div className="journey-enter space-y-5">
      <PageHero eyebrow="Academic follow-up" icon={FiBarChart2} title="Reports" art="reports" scoped
        description="Who needs support, how each intake is holding on, and where grading is waiting — across classes and teachers."
        actions={<>
          <Link to="/admin/students" className={heroGhost}>Students</Link>
          <Link to="/admin/attendance" className={heroGhost}>Attendance</Link>
        </>}
        footer={<div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-medium text-muted">Narrow the at-risk list and retention report</p><AnalyticsFilters value={filter} onChange={setFilter} /></div>} />
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
