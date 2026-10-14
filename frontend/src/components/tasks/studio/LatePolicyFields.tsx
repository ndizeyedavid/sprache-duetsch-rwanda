import { latePolicyLabel } from '../../assignments/homework/late-policy';
import type { TaskDraft } from '../task-types';
import { NumberField } from './fields';

type Props = { draft: TaskDraft; update: (p: Partial<TaskDraft>) => void };

/** Grace period and late penalty. Students see the resulting sentence before the deadline. */
export function LatePolicyFields({ draft: d, update }: Props) {
  return (
    <fieldset className="space-y-3 rounded-field border border-base-300 p-3">
      <legend className="px-1 text-sm font-semibold">Late penalty</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Grace period (minutes)" hint="On time if handed in within this." value={d.gracePeriodMinutes} min={0} max={10080}
          onChange={gracePeriodMinutes => update({ gracePeriodMinutes })} />
        <NumberField label="% off per late day" hint="Each started 24 hours counts." value={d.latePenaltyPercentPerDay} min={0} max={100} step={0.5}
          onChange={latePenaltyPercentPerDay => update({ latePenaltyPercentPerDay })} />
        <NumberField label="Maximum % off" value={d.latePenaltyMaxPercent} min={0} max={100} step={0.5}
          onChange={latePenaltyMaxPercent => update({ latePenaltyMaxPercent })} />
      </div>
      <p className="text-xs text-muted">Students see: “{latePolicyLabel(d)}”. You can waive the penalty for one student when grading, or give them an extension.</p>
    </fieldset>
  );
}
