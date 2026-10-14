import { useApi } from '../../hooks/useApi';
import { listIntakes,listLevels } from '../../lib/services';

export type AnalyticsFilterValue = { levelId: string; intakeId: string };

/** Level + intake selects shared by the at-risk list and the retention report. */
export function AnalyticsFilters({ value, onChange }: { value: AnalyticsFilterValue; onChange: (value: AnalyticsFilterValue) => void }) {
  const levels = useApi('analytics-levels', listLevels);
  const intakes = useApi('analytics-intakes', listIntakes);
  return (
    <div className="flex flex-wrap gap-2">
      <select aria-label="Filter by level" className="select select-sm w-full sm:w-auto" value={value.levelId} onChange={e => onChange({ ...value, levelId: e.target.value })}>
        <option value="">All levels</option>
        {(levels.data ?? []).map(level => <option key={level.id} value={level.id}>{level.code} · {level.title}</option>)}
      </select>
      <select aria-label="Filter by intake" className="select select-sm w-full sm:w-auto" value={value.intakeId} onChange={e => onChange({ ...value, intakeId: e.target.value })}>
        <option value="">All intakes</option>
        {(intakes.data ?? []).map(intake => <option key={intake.id} value={intake.id}>{intake.name}</option>)}
      </select>
    </div>
  );
}
