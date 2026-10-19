import { FiCheck,FiLayers,FiUsers } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { money } from '../../lib/services/money';
import type { IntakeOverview } from '../../lib/services/intake-overview';
import { collectedShare,dateRange,PHASE_DOT,PHASE_LABEL } from './utils';

type Props = { intake: IntakeOverview; active: boolean; onSelect: () => void };

/** One intake with everything needed to pick it at a glance: dates, phase, people and money. */
export function IntakeOption({ intake, active, onSelect }: Props) {
  const { counts, finance } = intake;
  const share = finance ? collectedShare(finance) : 0;
  return (
    <button type="button" onClick={onSelect} aria-pressed={active}
      className={`w-full rounded-box border p-3 text-left transition-colors ${active ? 'border-primary bg-brand-tint' : 'border-line bg-base-100 hover:border-primary'}`}>
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{intake.name}</span>
          <span className="mt-0.5 block font-mono text-[0.6875rem] text-muted">{intake.code}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[0.6875rem] font-semibold">
          <span className={`size-2 rounded-full ${PHASE_DOT[intake.phase]}`} aria-hidden />{PHASE_LABEL[intake.phase]}
        </span>
        {active ? <FiCheck className="mt-0.5 shrink-0 text-primary" aria-label="Selected" /> : null}
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{dateRange(intake)}</span>
        <span className="inline-flex items-center gap-1"><FiUsers aria-hidden />{counts.students} students</span>
        <span className="inline-flex items-center gap-1"><FiLayers aria-hidden />{counts.classes} classes</span>
      </span>
      {intake.levels.length ? (
        <span className="mt-2 flex flex-wrap gap-1">
          {intake.levels.map((level) => (
            <span key={level} className="rounded-full bg-base-200 px-2 py-0.5 text-[0.625rem] font-bold">{level}</span>
          ))}
        </span>
      ) : null}
      {finance ? (
        <span className="mt-2.5 block">
          <span className="flex justify-between gap-2 text-[0.6875rem]">
            <span><strong>{currencyAmount(money(finance.collected), intake.currency)}</strong> of {currencyAmount(money(finance.billed), intake.currency)}</span>
            <span className="text-muted">{share}%</span>
          </span>
          <progress className="progress progress-primary mt-1 h-1.5 w-full" value={share} max={100} aria-label="Collected" />
          <span className="block text-[0.6875rem] text-muted">{currencyAmount(money(finance.outstanding), intake.currency)} outstanding</span>
        </span>
      ) : null}
    </button>
  );
}
