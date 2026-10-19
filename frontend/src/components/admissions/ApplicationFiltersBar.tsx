import type { ApplicationSource } from '../../lib/admissions-types';
import { useIntakeScope } from '../../lib/intake-scope/store';
import { SearchField } from '../ui/SearchField';
import { FIELD,SELECT,SOURCE_LABEL } from './constants';
import type { AdmissionRefs } from './useAdmissionRefs';
import type { QueueFilters } from './useApplicationQueue';

type Props = {
  filters: QueueFilters;
  refs: AdmissionRefs;
  onChange: (patch: Partial<QueueFilters>) => void;
  onClear: () => void;
  /** The waitlist board only filters by level and intake. */
  compact?: boolean;
};

export function ApplicationFiltersBar({ filters, refs, onChange, onClear, compact = false }: Props) {
  const active = Object.values(filters).some(Boolean);
  // The header intake switcher already scopes the queue.
  const scoped = Boolean(useIntakeScope());
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {!compact ? (
        <SearchField className="input-sm sm:col-span-2" placeholder="Name, email, phone or reference" ariaLabel="Search applications"
          value={filters.search ?? ''} onChange={(search) => onChange({ search })} />
      ) : null}
      <select aria-label="Level" className={SELECT} value={filters.levelId ?? ''} onChange={(event) => { const levelId = event.currentTarget.value; onChange({ levelId }); }}>
        <option value="">All levels</option>
        {refs.levels.map((level) => <option key={level.id} value={level.id}>{level.code} — {level.title}</option>)}
      </select>
      {scoped ? null : <select aria-label="Intake" className={SELECT} value={filters.intakeId ?? ''} onChange={(event) => { const intakeId = event.currentTarget.value; onChange({ intakeId }); }}>
        <option value="">All intakes</option>
        {refs.intakes.map((intake) => <option key={intake.id} value={intake.id}>{intake.name}</option>)}
      </select>}
      {!compact ? (
        <>
          <select aria-label="Campus" className={SELECT} value={filters.campusId ?? ''} onChange={(event) => { const campusId = event.currentTarget.value; onChange({ campusId }); }}>
            <option value="">All campuses</option>
            {refs.campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name ?? campus.code}</option>)}
          </select>
          <select aria-label="Source" className={SELECT} value={filters.source ?? ''}
            onChange={(event) => { const source = event.currentTarget.value as ApplicationSource | ''; onChange({ source }); }}>
            <option value="">All sources</option>
            {Object.entries(SOURCE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted">From
            <input type="date" className={FIELD} value={filters.from ?? ''} onChange={(event) => { const from = event.currentTarget.value; onChange({ from }); }} />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted">To
            <input type="date" className={FIELD} value={filters.to ?? ''} onChange={(event) => { const to = event.currentTarget.value; onChange({ to }); }} />
          </label>
        </>
      ) : null}
      {active ? <button type="button" className="btn btn-ghost btn-sm justify-self-start rounded-full text-xs" onClick={onClear}>Clear filters</button> : null}
    </div>
  );
}
