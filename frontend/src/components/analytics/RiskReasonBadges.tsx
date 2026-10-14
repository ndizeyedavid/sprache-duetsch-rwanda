import type { RiskReason } from '../../lib/analytics-api';
import { REASON_SHORT,SEVERITY_BADGE } from './constants';

/** One soft badge per reason; colour = severity, full explanation on hover / screen readers. */
export function RiskReasonBadges({ reasons }: { reasons: RiskReason[] }) {
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Risk reasons">
      {reasons.map(reason => (
        <li key={reason.code}>
          <span title={reason.label} className={`badge badge-soft badge-sm ${SEVERITY_BADGE[reason.severity]}`}>
            {REASON_SHORT[reason.code]}
            <span className="sr-only">: {reason.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
