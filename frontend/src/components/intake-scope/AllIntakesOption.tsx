import { FiCheck,FiGlobe } from 'react-icons/fi';
import type { IntakeOverview } from '../../lib/services/intake-overview';

type Props = { intakes: IntakeOverview[]; active: boolean; onSelect: () => void };

export function AllIntakesOption({ intakes, active, onSelect }: Props) {
  const enrolments = intakes.reduce((sum, intake) => sum + intake.counts.enrollments, 0);
  return (
    <button type="button" onClick={onSelect} aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-box border p-3 text-left ${active ? 'border-primary bg-brand-tint' : 'border-line hover:border-primary'}`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-primary-content"><FiGlobe aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">All intakes</span>
        <span className="block text-xs text-muted">{intakes.length} intakes · {enrolments} enrolments · nothing filtered</span>
      </span>
      {active ? <FiCheck className="shrink-0 text-primary" aria-label="Selected" /> : null}
    </button>
  );
}
