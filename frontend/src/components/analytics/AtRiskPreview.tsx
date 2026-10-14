import { AtRiskPanel } from './AtRiskPanel';
import { useAtRisk } from './useAtRisk';

/** Dashboard teaser: the five highest-risk enrolments, linking to the full Reports page. */
export function AtRiskPreview() {
  const risk = useAtRisk({}, 5);
  return (
    <AtRiskPanel
      risk={risk}
      compact
      paginate={false}
      linkFor={row => `/admin/students/${row.student.id}`}
      action={{ label: 'All reports', to: '/admin/reports' }}
    />
  );
}
